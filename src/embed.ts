import './lib/compatibility';

import { normalizeElement } from './lib/dom';
import { createEmbedIframe } from './lib/embed';
import { postMessage, parseMessage } from './lib/communication';
import EmbedCallback from './lib/callback';
import type {
  EmbedEventName,
  EmbedMessageReceived,
  EmbedMessageReceivedEvent,
  EmbedMessageReceivedMethod,
  EmbedParameters,
  ScoreTrackConfiguration,
  PartConfiguration,
  NoteCursorPosition,
  NoteCursorPositionOptional,
  MeasureDetails,
  NoteDetails,
  MetronomeMode,
  PlaybackPosition,
} from './types';

const embeds = new WeakMap();
const embedsReady = new WeakMap();

class Embed {
  origin: string = '*';
  element!: HTMLIFrameElement;
  embedCallback!: EmbedCallback;

  /**
   * Create a new Flat Embed
   *
   * @param element A reference to a Flat Embed iframe or a container for the new iframe
   * @param parameters Parameters for the new iframe
   */
  constructor(element: HTMLIFrameElement | HTMLElement | string, parameters: EmbedParameters = {}) {
    element = normalizeElement(element);

    // Keep a single object instance per iframe
    if (embeds.has(element)) {
      return embeds.get(element);
    }

    // Create new element iframe if needed
    if (element.nodeName !== 'IFRAME') {
      element = createEmbedIframe(element, parameters);
    }

    this.element = element as HTMLIFrameElement;
    this.embedCallback = new EmbedCallback(this);

    const onReady = new Promise<void>(resolve => {
      // Handle incoming messages from embed
      const onMessage = (event: MessageEvent) => {
        if (this.element.contentWindow !== event.source) {
          return;
        }

        if (this.origin === '*') {
          this.origin = event.origin;
        }

        // Parse inbound message
        const data: EmbedMessageReceived = parseMessage(event.data);

        // Mark the embed as ready
        if (
          (data as EmbedMessageReceivedEvent).event === 'ready' ||
          (data as EmbedMessageReceivedMethod).method === 'ping'
        ) {
          resolve();
          return;
        }

        // Process regular messages from the embed
        this.embedCallback.process(data);
      };

      window.addEventListener('message', onMessage, false);
      postMessage(this, 'ping');
    });

    embeds.set(this.element, this);
    embedsReady.set(this.element, onReady);

    return this;
  }

  ready() {
    return embedsReady.get(this.element);
  }

  /**
   * Call a method on the embed
   *
   * @param method Name of the method to call
   * @param parameters Method parameters
   * @returns Call result from Embed (if any)
   */
  call(
    method: string,
    parameters: Record<string, unknown> | string | string[] | number | boolean | Uint8Array = {},
  ) {
    return new Promise((resolve, reject) => {
      return this.ready().then(() => {
        this.embedCallback.pushCall(method, resolve, reject);
        postMessage(this, method, parameters);
      });
    });
  }

  /**
   * Subscribe to a specific event
   *
   * @param event The name of the event.
   * @param callback The function to call when receiving an event
   */
  on(event: EmbedEventName, callback: () => void) {
    if (typeof event !== 'string') {
      throw new TypeError('An event name (string) is required');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('An callback (function) is required');
    }
    if (this.embedCallback.subscribeEvent(event, callback)) {
      this.call('addEventListener', event).catch(() => {});
    }
  }

  /**
   * Unsubscribe to a specific event
   *
   * @param event The name of the event.
   * @param callback The function to unsubscribe
   */
  off(event: EmbedEventName, callback?: () => void) {
    if (typeof event !== 'string') {
      throw new TypeError('An event name (string) is required');
    }
    if (this.embedCallback.unsubscribeEvent(event, callback)) {
      this.call('removeEventListener', event).catch(() => {});
    }
  }

  /**
   * Load a score hosted on Flat
   *
   * @param score The unique identifier of the score or an object with { score, sharingKey }
   * @return {Promise}
   * @reject {ApiError} Unable to load the score
   */
  loadFlatScore(score: string | { score: string; sharingKey?: string }): Promise<void> {
    if (typeof score === 'string') {
      score = { score };
    }
    return this.call('loadFlatScore', score) as Promise<void>;
  }

  /**
   * Load a MusicXML score
   *
   * @param score The MusicXML file
   * @return {Promise}
   * @reject {Error} Unable to load the score
   */
  loadMusicXML(score: string | Uint8Array) {
    return this.call('loadMusicXML', score) as Promise<void>;
  }

  /**
   * Load a Flat JSON score
   *
   * @param score The JSON of the score
   * @return {Promise}
   * @reject {Error} Unable to load the score
   */
  loadJSON(score: string | Record<string, unknown>) {
    return this.call('loadJSON', score) as Promise<void>;
  }

  /**
   * Get the score in Flat JSON format
   *
   * @return The Flat data format
   */
  getJSON() {
    return this.call('getJSON') as Promise<Record<string, unknown>>;
  }

  /**
   * Convert the displayed score in MusicXML
   *
   * @param options Conversion options (`compressed`)
   * @return {Promise}
   * @fullfill MusicXML File
   * @reject Conversion error
   */
  getMusicXML(options?: { compressed?: boolean }): Promise<string | Uint8Array> {
    return new Promise((resolve, reject) => {
      options = options || {};
      if (typeof options !== 'object') {
        return reject(new TypeError('Options must be an object'));
      }
      this.call('getMusicXML', options)
        .then(data => {
          // Plain XML
          if (typeof data === 'string') {
            return resolve(data);
          }
          // Compressed, re-create Uint8Array
          return resolve(new Uint8Array(data as [number]));
        })
        .catch(reject);
    });
  }

  /**
   * Convert the displayed score in PNG
   *
   * @return {Promise}
   * @fullfill PNG File (Uint8Array or string for dataURL)
   * @reject Conversion error
   */
  getPNG(options?: {
    /** Export result (either a PNG returned as Uint8Array or in dataURL) */
    result?: 'Uint8Array' | 'dataURL';
    /** DPI of exported image (min: 50, max: 300, default: 150) */
    dpi?: number;
    /** Layout of exported image */
    layout?: 'track' | 'page';
  }): Promise<Uint8Array | string> {
    return new Promise((resolve, reject) => {
      options = options || {};
      if (typeof options !== 'object') {
        return reject(new TypeError('Options must be an object'));
      }
      this.call('getPNG', options)
        .then(data => {
          if (typeof data === 'string') {
            return resolve(data);
          }
          resolve(new Uint8Array(data as [number]));
        })
        .catch(reject);
    });
  }

  /**
   * Convert the displayed score in MIDI
   *
   * @return {Promise}
   * @fullfill MIDI File
   * @reject Conversion error
   */
  getMIDI(): Promise<Uint8Array> {
    return this.call('getMIDI').then(data => new Uint8Array(data as [number]));
  }

  /**
   * Get the metadata of the score (for scores hosted on Flat)
   *
   * TODO: Type the result from OpenAPI response
   *
   * @return {Promise}
   * @fulfill {object} The Flat data format (result from https://flat.io/developers/api/reference/#operation/getScore)
   */
  getFlatScoreMetadata() {
    return this.call('getFlatScoreMetadata');
  }

  /**
   * Get the whole embed config
   *
   * TODO: Type all embed options
   *
   * @return {Promise}
   * @fullfill {object} An object containing the config of the embed
   */
  getEmbedConfig(): Promise<Record<string, unknown>> {
    return this.call('getEmbedConfig') as Promise<Record<string, unknown>>;
  }

  /**
   * Set a config for the embed mode
   * This config can be fetched with `getEmbed()` (as `editor` value)
   * This config will be applied at the next score loading
   *
   * TODO: Type all options
   *
   * @param {object} editor The editor config
   * @return {Promise}
   * @fullfill {object} An object containing the config of the editor
   */
  setEditorConfig(editor: Record<string, unknown>): Promise<void> {
    return this.call('setEditorConfig', editor) as Promise<void>;
  }

  /**
   * Toggle fullscreen state
   *
   * @param {boolean} active `true` to switch on fullscreen, `false` to switch off
   * @return {Promise} Once the state changed
   */
  fullscreen(active: boolean): Promise<void> {
    return this.call('fullscreen', active) as Promise<void>;
  }

  /**
   * Start the playback
   */
  play(): Promise<void> {
    return this.call('play') as Promise<void>;
  }

  /**
   * Pause the playback
   */
  pause(): Promise<void> {
    return this.call('pause') as Promise<void>;
  }

  /**
   * Stop the playback
   */
  stop(): Promise<void> {
    return this.call('stop') as Promise<void>;
  }

  /**
   * Mute playback
   */
  mute(): Promise<void> {
    return this.call('mute') as Promise<void>;
  }

  /**
   * Get the current master volume
   */
  getMasterVolume(): Promise<number> {
    return this.call('getMasterVolume') as Promise<number>;
  }

  /**
   * Set the current master volume
   */
  setMasterVolume(parameters: { volume: number }): Promise<void> {
    return this.call('setMasterVolume', parameters) as Promise<void>;
  }

  /**
   * Get the volume of a part
   */
  getPartVolume(parameters: { partUuid: string }): Promise<number> {
    return this.call('getPartVolume', parameters) as Promise<number>;
  }

  /**
   * Set the volume of a part
   */
  setPartVolume(parameters: { partUuid: string; volume: number }): Promise<void> {
    return this.call('setPartVolume', parameters) as Promise<void>;
  }

  /**
   * Mute a part
   */
  mutePart(parameters: { partUuid: string }): Promise<void> {
    return this.call('mutePart', parameters) as Promise<void>;
  }

  /**
   * Mute a part
   */
  unmutePart(parameters: { partUuid: string }): Promise<void> {
    return this.call('unmutePart', parameters) as Promise<void>;
  }

  /**
   * Enable the solo mode for a part
   */
  setPartSoloMode(parameters: { partUuid: string }): Promise<void> {
    return this.call('setPartSoloMode', parameters) as Promise<void>;
  }

  /**
   * Disable the solo mode for a part
   */
  unsetPartSoloMode(parameters: { partUuid: string }): Promise<void> {
    return this.call('unsetPartSoloMode', parameters) as Promise<void>;
  }

  /**
   * Get the state of the solo mode of a part
   */
  getPartSoloMode(parameters: { partUuid: string }): Promise<boolean> {
    return this.call('getPartSoloMode', parameters) as Promise<boolean>;
  }

  /**
   * Get the volume of a part
   */
  getPartReverb(parameters: { partUuid: string }): Promise<number> {
    return this.call('getPartReverb', parameters) as Promise<number>;
  }

  /**
   * Set the volume of a part
   */
  setPartReverb(parameters: { partUuid: string; reverberation: number }): Promise<void> {
    return this.call('setPartReverb', parameters) as Promise<void>;
  }

  /**
   * Configure a new audio or video track
   */
  setTrack(parameters: ScoreTrackConfiguration): Promise<void> {
    return this.call('setTrack', parameters as unknown as Record<string, unknown>) as Promise<void>;
  }

  /**
   * Enabled a previously configured track
   */
  useTrack(parameters: { id: string }): Promise<void> {
    return this.call('useTrack', parameters) as Promise<void>;
  }

  /**
   * Seek the audio track to a specified duration
   */
  seekTrackTo(parameters: { time: number }): Promise<void> {
    return this.call('seekTrackTo', parameters) as Promise<void>;
  }

  /**
   * Print the score
   */
  print(): Promise<void> {
    return this.call('print') as Promise<void>;
  }

  /**
   * Get the current zoom ratio
   *
   * @return {Promise}
   * @fullfill {number} The current scale ratio (0.5 to 3)
   */
  getZoom(): Promise<number> {
    return this.call('getZoom') as Promise<number>;
  }

  /**
   * Set a new zoom ratio (this will disable the zoom auto if set)
   *
   * @param {number} zoom The scale ratio (0.5 to 3)
   * @return {Promise}
   * @fullfill {number} The scale ratio applied
   */
  setZoom(zoom: number): Promise<number> {
    return this.call('setZoom', zoom) as Promise<number>;
  }

  /**
   * Get the auto-zoom
   *
   * @return {Promise}
   * @fullfill {boolean} `true` if enabled, `false` if disabled
   */
  getAutoZoom(): Promise<boolean> {
    return this.call('getAutoZoom') as Promise<boolean>;
  }

  /**
   * Enable or disable the auto-zoom
   *
   * @param {boolean} state `true` if enabled, `false` if disabled
   * @return {Promise}
   * @fullfill {boolean} The auto-zoom mode
   */
  setAutoZoom(state: boolean): Promise<boolean> {
    return this.call('setAutoZoom', state) as Promise<boolean>;
  }

  /**
   * Set the focus to the score
   */
  focusScore(): Promise<void> {
    return this.call('focusScore') as Promise<void>;
  }

  /**
   * Get cursor position
   *
   * @return {Promise}
   * @fullfill {boolean} Current cursor position
   */
  getCursorPosition(): Promise<NoteCursorPosition> {
    return this.call('getCursorPosition') as unknown as Promise<NoteCursorPosition>;
  }

  /**
   * Set cursor position
   *
   * @param {object} position New cursor position
   * @return {Promise}
   * @fullfill {boolean} Current cursor position
   */
  setCursorPosition(position: NoteCursorPositionOptional): Promise<void> {
    return this.call('setCursorPosition', position as Record<string, unknown>) as Promise<void>;
  }

  /**
   * Get all the parts information
   *
   * @return {Promise}
   * @fullfill {array} List of the parts
   */
  getParts(): Promise<PartConfiguration[]> {
    return this.call('getParts') as Promise<PartConfiguration[]>;
  }

  /**
   * Get the displayed parts
   *
   * @return {Promise}
   * @fullfill {array} List of the displayed parts
   */
  getDisplayedParts(): Promise<PartConfiguration[]> {
    return this.call('getDisplayedParts') as Promise<PartConfiguration[]>;
  }

  /**
   * Choose the parts to display
   *
   * @param {array} parts List of the parts to display (UUIDs, indexes/idx, names or abbv)
   * @return {Promise}
   */
  setDisplayedParts(parts: string[]): Promise<void> {
    return this.call('setDisplayedParts', parts) as Promise<void>;
  }

  /**
   * Get the number of measures in the score.
   *
   * @return {Promise}
   * @fullfill {Number} The number of measures in the score
   */
  getNbMeasures(): Promise<number> {
    return this.call('getNbMeasures') as Promise<number>;
  }

  /**
   * Get the measures uuids of the score
   *
   * @return {Promise}
   * @fullfill {Array} The list of measures uuids.
   */
  getMeasuresUuids(): Promise<string[]> {
    return this.call('getMeasuresUuids') as Promise<string[]>;
  }

  /**
   * Get all the parts information
   *
   * @return {Promise}
   * @fullfill {object} Measure details
   */
  getMeasureDetails(): Promise<MeasureDetails> {
    return this.call('getMeasureDetails') as Promise<MeasureDetails>;
  }

  /**
   * Get the number of parts in the score.
   *
   * @return {Promise}
   * @fullfill {Number} The number of parts in the score
   */
  getNbParts(): Promise<number> {
    return this.call('getNbParts') as Promise<number>;
  }

  /**
   * Get the parts uuids of the score
   *
   * @return {Promise}
   * @fullfill {Array} The list of parts uuids.
   */
  getPartsUuids(): Promise<string[]> {
    return this.call('getPartsUuids') as Promise<string[]>;
  }

  /**
   * Get the voice uuids that are present in a given measure.
   *
   * @return {Promise}
   * @fullfill {Array} The list of voices uuids.
   */
  getMeasureVoicesUuids(parameters: { partUuid: string; measureUuid: string }): Promise<string[]> {
    return this.call('getMeasureVoicesUuids', parameters) as Promise<string[]>;
  }

  /**
   * Get the number of notes in a voice for a given measure.
   *
   * @return {Promise}
   * @fullfill {Number} The number of notes in a voice for a given measure.
   */
  getMeasureNbNotes(parameters: {
    partUuid: string;
    measureUuid: string;
    voiceUuid: string;
  }): Promise<number> {
    return this.call('getMeasureNbNotes', parameters) as Promise<number>;
  }

  /**
   * Get information about a specific note.
   *
   * @return {Promise}
   * @fullfill {object} Note details
   */
  getNoteData(parameters: {
    partUuid: string;
    measureUuid: string;
    voiceUuid: string;
    noteIdx: number;
  }): Promise<NoteDetails> {
    return this.call('getNoteData', parameters) as Promise<NoteDetails>;
  }

  /**
   * Get information about a specific note.
   *
   * @return {Promise}
   * @fullfill {Number} Note index in the voice/measure.
   */
  playbackPositionToNoteIdx(parameters: {
    partUuid: string;
    voiceUuid: string;
    playbackPosition: PlaybackPosition;
  }): Promise<number> {
    return this.call('playbackPositionToNoteIdx', parameters) as Promise<number>;
  }

  /**
   * Get all the parts information
   *
   * @return {Promise}
   * @fullfill {object} Note details
   */
  getNoteDetails(): Promise<NoteDetails> {
    return this.call('getNoteDetails') as Promise<NoteDetails>;
  }

  /**
   * Move the cursor to the next left item in the score (grace note, note or rest).
   *
   * @param mute false to play the note the cursor is moving to
   */
  goLeft(mute: boolean = false): Promise<void> {
    return this.call('goLeft', { mute }) as Promise<void>;
  }

  /**
   * Move the cursor to the next right item in the score (grace note, note or rest).
   *
   * @param mute false to play the note the cursor is moving to
   */
  goRight(mute: boolean = false): Promise<void> {
    return this.call('goRight', { mute }) as Promise<void>;
  }

  /**
   * Get the current metronome mode
   *
   * @returns {Promise}
   * @fullfill {Number} The metronome mode
   */
  getMetronomeMode(): Promise<MetronomeMode> {
    return this.call('getMetronomeMode') as Promise<MetronomeMode>;
  }

  /**
   * Sett the metronome mode.
   *
   * Mode is defined as:
   * ``` javascript
   * const METRONOME_MODES = {
   *   COUNT_IN: 0,
   *   CONTINUOUS: 1,
   *   DISABLED: 2,
   * };
   * ```
   *
   * @param {Number} mode the new metronome mode
   * @return {Promise}
   */
  setMetronomeMode(mode: MetronomeMode): Promise<void> {
    return this.call('setMetronomeMode', { mode }) as Promise<void>;
  }

  /**
   * Get the current metronome mode
   *
   * @returns {Promise}
   * @fullfill The Playback speed
   */
  getPlaybackSpeed(): Promise<number> {
    return this.call('getPlaybackSpeed') as Promise<number>;
  }

  /**
   * Set the playback speed.
   *
   * 1 is the regular value, then it is a value between 0.2 and 2.
   *
   * @param {Number} speed the new playback speed
   */
  setPlaybackSpeed(speed: number): Promise<void> {
    return this.call('setPlaybackSpeed', { speed }) as Promise<void>;
  }

  /**
   * Scroll to the cursor position in the score.
   *
   * The scrolling is done asynchronously, so it is not guaranteed that it will be complete
   * by the time the callback is called.
   */
  scrollToCursor(): Promise<void> {
    return this.call('scrollToCursor') as Promise<void>;
  }
}

export default Embed;
