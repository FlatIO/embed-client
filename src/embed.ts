import './lib/compatibility';

import EmbedCallback from './lib/callback';
import { parseMessage, postMessage } from './lib/communication';
import { normalizeElement } from './lib/dom';
import { createEmbedIframe } from './lib/embed';
import type {
  EmbedEventName,
  EmbedMessageReceived,
  EmbedMessageReceivedEvent,
  EmbedMessageReceivedMethod,
  EmbedParameters,
  MeasureDetails,
  MetronomeMode,
  NoteCursorPosition,
  NoteCursorPositionOptional,
  NoteDetails,
  PartConfiguration,
  PlaybackPosition,
  ScoreTrackConfiguration,
} from './types';
import type { ScoreDetails } from './types/scoreDetails';

const embeds = new WeakMap<HTMLIFrameElement, Embed>();
const embedsReady = new WeakMap<HTMLIFrameElement, Promise<void>>();

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
    const normalizedElement = normalizeElement(element);

    // Keep a single object instance per iframe
    if (normalizedElement instanceof HTMLIFrameElement && embeds.has(normalizedElement)) {
      return embeds.get(normalizedElement) as Embed;
    }

    // Create new element iframe if needed
    let iframeElement: HTMLIFrameElement;
    if (normalizedElement.nodeName !== 'IFRAME') {
      iframeElement = createEmbedIframe(normalizedElement, parameters);
    } else {
      iframeElement = normalizedElement as HTMLIFrameElement;
    }

    this.element = iframeElement;
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

  /**
   * Wait for the embed to be ready
   *
   * Returns a promise that resolves when the embed iframe has fully loaded and
   * communication with the Flat embed has been established. This method is automatically
   * called by all other embed methods, so you typically don't need to call it directly.
   * However, it can be useful when you want to know exactly when the embed is ready
   * without performing any other action.
   *
   * @returns A promise that resolves when the embed is ready
   *
   * @example
   * // Explicitly wait for embed to be ready
   * const embed = new Embed('container', {
   *   score: '56ae21579a127715a02901a6'
   * });
   * await embed.ready();
   * console.log('Embed is now ready!');
   *
   * @example
   * // Note: Other methods automatically wait for ready state
   * const embed = new Embed('container');
   * // No need to call ready() - play() will wait automatically
   * await embed.play();
   *
   * @note All embed methods automatically call ready() internally, so explicit calls are optional
   */
  ready() {
    return embedsReady.get(this.element) || Promise.resolve();
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
   * Loads a Flat score by its unique identifier. For private scores, you must provide
   * the sharing key obtained from a private link.
   *
   * @param score - The score identifier as a string, or an object containing:
   *   - `score`: The unique identifier of the score (required)
   *   - `sharingKey`: The sharing key for private scores (optional)
   * @returns A promise that resolves when the score is successfully loaded
   * @throws {TypeError} If the score parameter is invalid
   * @throws {Error} If the score cannot be loaded (e.g., not found, access denied)
   *
   * @example
   * // Load a public score
   * await embed.loadFlatScore('56ae21579a127715a02901a6');
   *
   * @example
   * // Load a private score with sharing key
   * await embed.loadFlatScore({
   *   score: '56ae21579a127715a02901a6',
   *   sharingKey: 'f79c3c0dd1fc76ed8b30d6f2c845c8c30f11fe88d9fc39ab96e8e407629d4885'
   * });
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
   * Loads a MusicXML score from a string or binary data. The score will be converted
   * to Flat's internal format and displayed in the embed.
   *
   * @param score - The MusicXML content as a string (XML) or Uint8Array (compressed MXL)
   * @returns A promise that resolves when the score is successfully loaded
   * @throws {TypeError} If the score format is invalid
   * @throws {Error} If the MusicXML cannot be parsed or loaded
   *
   * @example
   * // Load from XML string
   * const xmlString = '<?xml version="1.0"?>...';
   * await embed.loadMusicXML(xmlString);
   *
   * @example
   * // Load from compressed MXL file
   * const response = await fetch('score.mxl');
   * const buffer = await response.arrayBuffer();
   * await embed.loadMusicXML(new Uint8Array(buffer));
   */
  loadMusicXML(score: string | Uint8Array) {
    return this.call('loadMusicXML', score) as Promise<void>;
  }

  /**
   * Load a MIDI score
   *
   * Loads a MIDI file and converts it to sheet music notation. Note that MIDI files
   * contain performance data rather than notation, so the conversion may not perfectly
   * represent the original musical intent.
   *
   * @param score - The MIDI file as a Uint8Array
   * @returns A promise that resolves when the score is successfully loaded
   * @throws {TypeError} If the score format is invalid
   * @throws {Error} If the MIDI file cannot be parsed or loaded
   *
   * @example
   * // Load MIDI file from URL
   * const response = await fetch('song.mid');
   * const buffer = await response.arrayBuffer();
   * await embed.loadMIDI(new Uint8Array(buffer));
   *
   * @example
   * // Load MIDI file from file input
   * const file = document.getElementById('fileInput').files[0];
   * const buffer = await file.arrayBuffer();
   * await embed.loadMIDI(new Uint8Array(buffer));
   */
  loadMIDI(score: Uint8Array): Promise<void> {
    return this.call('loadMIDI', score) as Promise<void>;
  }

  /**
   * Load a Flat JSON score
   *
   * Loads a score from Flat's native JSON format. This format preserves all score
   * data and is the most reliable way to transfer scores between Flat applications.
   *
   * @param score - The score data as a JSON string or JavaScript object
   * @returns A promise that resolves when the score is successfully loaded
   * @throws {TypeError} If the JSON is invalid or cannot be parsed
   * @throws {Error} If the score data is malformed or cannot be loaded
   *
   * @example
   * // Load from JSON object
   * const scoreData = await fetch('score.json').then(r => r.json());
   * await embed.loadJSON(scoreData);
   *
   * @example
   * // Load from JSON string
   * const jsonString = '{"score-partwise": {...}}';
   * await embed.loadJSON(jsonString);
   */
  loadJSON(score: string | Record<string, unknown>) {
    return this.call('loadJSON', score) as Promise<void>;
  }

  /**
   * Get the score in Flat JSON format
   *
   * Exports the currently loaded score as Flat's native JSON format. This format
   * preserves all score data including notation, layout, and metadata.
   *
   * @returns A promise that resolves with the score data as a JavaScript object
   * @throws {Error} If no score is currently loaded
   *
   * @example
   * // Export and save score data
   * const scoreData = await embed.getJSON();
   * const jsonString = JSON.stringify(scoreData);
   *
   * // Save to file
   * const blob = new Blob([jsonString], { type: 'application/json' });
   * const url = URL.createObjectURL(blob);
   * const a = document.createElement('a');
   * a.href = url;
   * a.download = 'score.json';
   * a.click();
   */
  getJSON() {
    return this.call('getJSON') as Promise<Record<string, unknown>>;
  }

  /**
   * Convert the displayed score to MusicXML
   *
   * Exports the currently loaded score as MusicXML, the standard format for sheet music
   * notation exchange. Supports both uncompressed XML and compressed MXL formats.
   *
   * @param options - Export options:
   *   - `compressed`: If true, returns compressed MusicXML (.mxl) as Uint8Array.
   *                   If false (default), returns uncompressed XML as string.
   * @returns A promise that resolves with the MusicXML data
   * @throws {TypeError} If options parameter is invalid
   * @throws {Error} If no score is loaded or conversion fails
   *
   * @example
   * // Get uncompressed MusicXML
   * const xml = await embed.getMusicXML();
   * console.log(xml); // <?xml version="1.0"...
   *
   * @example
   * // Get compressed MusicXML (.mxl)
   * const mxl = await embed.getMusicXML({ compressed: true });
   * const blob = new Blob([mxl], { type: 'application/vnd.recordare.musicxml' });
   * const url = URL.createObjectURL(blob);
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
   * Convert the displayed score to PNG image
   *
   * Exports the currently loaded score as a PNG image. Supports various export options
   * including resolution, layout mode, and output format.
   *
   * @param options - Export options:
   *   - `result`: Output format - 'Uint8Array' (default) or 'dataURL'
   *   - `dpi`: Resolution in dots per inch (50-300, default: 150)
   *   - `layout`: Layout mode - 'track' (default, horizontal single system) or 'page'
   * @returns A promise that resolves with the PNG data
   * @throws {TypeError} If options parameter is invalid
   * @throws {Error} If no score is loaded or conversion fails
   *
   * @example
   * // Get PNG as Uint8Array
   * const pngData = await embed.getPNG();
   * const blob = new Blob([pngData], { type: 'image/png' });
   *
   * @example
   * // Get PNG as data URL for direct display
   * const dataUrl = await embed.getPNG({ result: 'dataURL' });
   * document.getElementById('preview').src = dataUrl;
   *
   * @example
   * // High resolution export with page layout
   * const hqPng = await embed.getPNG({ dpi: 300, layout: 'page' });
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
   * Convert the displayed score to MIDI
   *
   * Exports the currently loaded score as a MIDI file. The MIDI file will contain
   * performance data including notes, tempo, dynamics, and instrument information.
   * Note that some notation elements may not be represented in MIDI format.
   *
   * @returns A promise that resolves with a Uint8Array containing the MIDI file data
   * @throws {Error} If no score is loaded or conversion fails
   *
   * @example
   * // Export score as MIDI
   * const midiData = await embed.getMIDI();
   *
   * // Save as file
   * const blob = new Blob([midiData], { type: 'audio/midi' });
   * const url = URL.createObjectURL(blob);
   * const a = document.createElement('a');
   * a.href = url;
   * a.download = 'score.mid';
   * a.click();
   *
   * @example
   * // Play MIDI in browser (requires Web MIDI API)
   * const midiData = await embed.getMIDI();
   * // ... use with Web MIDI API or MIDI player library
   */
  getMIDI(): Promise<Uint8Array> {
    return this.call('getMIDI').then(data => new Uint8Array(data as [number]));
  }

  /**
   * Convert the displayed score to MP3 audio
   *
   * Exports the currently loaded score as an MP3 audio file. The audio is rendered
   * client-side using the browser's audio capabilities. This may take some time
   * depending on the score length and complexity.
   *
   * @returns A promise that resolves with a Uint8Array containing the MP3 audio data
   * @throws {Error} If no score is loaded or audio rendering fails
   *
   * @example
   * // Get MP3 and play it
   * const mp3Data = await embed.getMP3();
   * const blob = new Blob([mp3Data], { type: 'audio/mpeg' });
   * const url = URL.createObjectURL(blob);
   * const audio = new Audio(url);
   * audio.play();
   *
   * @example
   * // Download MP3 file
   * const mp3Data = await embed.getMP3();
   * const blob = new Blob([mp3Data], { type: 'audio/mpeg' });
   * const url = URL.createObjectURL(blob);
   * const a = document.createElement('a');
   * a.href = url;
   * a.download = 'score.mp3';
   * a.click();
   */
  getMP3(): Promise<Uint8Array> {
    return this.call('getMP3').then(data => new Uint8Array(data as [number]));
  }

  /**
   * Convert the displayed score to WAV audio
   *
   * Exports the currently loaded score as a WAV audio file. The audio is rendered
   * client-side using the browser's audio capabilities. WAV files are uncompressed
   * and larger than MP3 but provide lossless audio quality.
   *
   * @returns A promise that resolves with a Uint8Array containing the WAV audio data
   * @throws {Error} If no score is loaded or audio rendering fails
   *
   * @example
   * // Get WAV and play it
   * const wavData = await embed.getWAV();
   * const blob = new Blob([wavData], { type: 'audio/wav' });
   * const url = URL.createObjectURL(blob);
   * const audio = new Audio(url);
   * audio.play();
   *
   * @example
   * // Download WAV file
   * const wavData = await embed.getWAV();
   * const blob = new Blob([wavData], { type: 'audio/wav' });
   * const url = URL.createObjectURL(blob);
   * const a = document.createElement('a');
   * a.href = url;
   * a.download = 'score.wav';
   * a.click();
   */
  getWAV(): Promise<Uint8Array> {
    return this.call('getWAV').then(data => new Uint8Array(data as [number]));
  }

  /**
   * Convert the displayed score to PDF
   *
   * Exports the currently loaded score as a PDF file. The PDF is generated client-side
   * and includes all pages of the score with proper page layout.
   *
   * @param options - Export options:
   *   - `parts`: Filter to specific parts (array of part UUIDs). If not specified, all parts are included.
   *   - `isConcertPitch`: Export in concert pitch instead of transposed (default: false)
   *   - `multiMeasuresRests`: Merge consecutive empty measures, useful for individual parts (default: false)
   *   - `outlineColoredNotes`: Outline colored notes for B&W printing (default: false)
   * @returns A promise that resolves with a Uint8Array containing the PDF data
   * @throws {TypeError} If options parameter is invalid
   * @throws {Error} If no score is loaded or conversion fails
   *
   * @example
   * // Get PDF as Uint8Array
   * const pdfData = await embed.getPDF();
   * const blob = new Blob([pdfData], { type: 'application/pdf' });
   *
   * @example
   * // Export specific parts with options
   * const parts = await embed.getParts();
   * const violinPdf = await embed.getPDF({
   *   parts: [parts[0].uuid],
   *   multiMeasuresRests: true,
   *   isConcertPitch: true
   * });
   */
  getPDF(options?: {
    /** Filter to specific parts (array of part UUIDs) */
    parts?: string[];
    /** Export in concert pitch instead of transposed (default: false) */
    isConcertPitch?: boolean;
    /** Merge consecutive empty measures (default: false) */
    multiMeasuresRests?: boolean;
    /** Outline colored notes for B&W printing (default: false) */
    outlineColoredNotes?: boolean;
  }): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      options = options || {};
      if (typeof options !== 'object') {
        return reject(new TypeError('Options must be an object'));
      }
      this.call('getPDF', options)
        .then(data => {
          resolve(new Uint8Array(data as [number]));
        })
        .catch(reject);
    });
  }

  /**
   * Get the metadata of the score (for scores hosted on Flat)
   *
   * Retrieves metadata for scores that are hosted on Flat, including title, composer,
   * collaborators, creation date, and other information available through Flat's API.
   * This method only works for scores loaded via `loadFlatScore()`.
   *
   * @returns A promise that resolves with the score metadata object
   * @throws {Error} If no Flat score is loaded or metadata is unavailable
   *
   * @example
   * // Get metadata after loading a Flat score
   * await embed.loadFlatScore('56ae21579a127715a02901a6');
   * const metadata = await embed.getFlatScoreMetadata();
   * console.log(`Title: ${metadata.title}`);
   * console.log(`Created by: ${metadata.user.username}`);
   *
   * @see {@link https://flat.io/developers/api/reference/#operation/getScore}
   */
  getFlatScoreMetadata(): Promise<ScoreDetails> {
    return this.call('getFlatScoreMetadata') as Promise<ScoreDetails>;
  }

  /**
   * Get the embed configuration
   *
   * Retrieves the complete configuration object for the embed, including display
   * settings, permissions, editor configuration, and enabled features.
   *
   * @returns A promise that resolves with the embed configuration object
   * @throws {Error} If the configuration cannot be retrieved
   *
   * @example
   * // Get current embed configuration
   * const config = await embed.getEmbedConfig();
   * console.log(`Mode: ${config.mode}`);
   * console.log(`Controls enabled: ${config.controlsPlay}`);
   */
  getEmbedConfig(): Promise<Record<string, unknown>> {
    return this.call('getEmbedConfig') as Promise<Record<string, unknown>>;
  }

  /**
   * Set the editor configuration
   *
   * Updates the editor configuration for the embed. These settings control various
   * aspects of the editor interface and behavior. The configuration is applied
   * when the next score is loaded.
   *
   * @param editor - Editor configuration object that may include:
   *   - displayMode: Score display mode
   *   - toolsetId: Active toolset identifier
   *   - hiddenTools: Array of tool identifiers to hide
   *   - Additional editor-specific settings
   * @returns A promise that resolves when the configuration is updated
   * @throws {Error} If the configuration is invalid
   *
   * @example
   * // Configure editor before loading a score
   * await embed.setEditorConfig({
   *   displayMode: 'responsive',
   *   hiddenTools: ['note-duration', 'note-pitch']
   * });
   * await embed.loadFlatScore('56ae21579a127715a02901a6');
   *
   * @note This configuration persists across score loads until changed
   */
  setEditorConfig(editor: Record<string, unknown>): Promise<void> {
    return this.call('setEditorConfig', editor) as Promise<void>;
  }

  /**
   * Toggle fullscreen mode
   *
   * Switches the embed in or out of fullscreen mode. When in fullscreen, the embed
   * expands to fill the entire screen, providing an immersive view of the score.
   *
   * @param active - true to enter fullscreen, false to exit fullscreen
   * @returns A promise that resolves when the fullscreen state has changed
   * @throws {Error} If fullscreen mode cannot be toggled (e.g., browser restrictions)
   *
   * @example
   * // Enter fullscreen mode
   * await embed.fullscreen(true);
   *
   * @example
   * // Exit fullscreen mode
   * await embed.fullscreen(false);
   *
   * @example
   * // Toggle fullscreen with user interaction
   * button.addEventListener('click', () => {
   *   embed.fullscreen(true);
   * });
   *
   * @note Fullscreen requests may require user interaction due to browser policies
   */
  fullscreen(active: boolean): Promise<void> {
    return this.call('fullscreen', active) as Promise<void>;
  }

  /**
   * Start playback
   *
   * Begins playing the score from the current cursor position. If playback was
   * previously paused, it resumes from the pause position. If stopped, it starts
   * from the beginning or the current cursor position.
   *
   * @returns A promise that resolves when playback has started
   * @throws {Error} If no score is loaded or playback cannot start
   *
   * @example
   * // Start playback
   * await embed.play();
   *
   * @example
   * // Play with event handling
   * embed.on('play', () => console.log('Playback started'));
   * await embed.play();
   *
   * @see {@link pause} - Pause playback
   * @see {@link stop} - Stop playback
   */
  play(): Promise<void> {
    return this.call('play') as Promise<void>;
  }

  /**
   * Pause playback
   *
   * Pauses the score playback at the current position. The playback position
   * is maintained, allowing you to resume from the same point using `play()`.
   *
   * @returns A promise that resolves when playback has been paused
   * @throws {Error} If no score is loaded or playback cannot be paused
   *
   * @example
   * // Pause playback
   * await embed.pause();
   *
   * @example
   * // Toggle play/pause
   * if (isPlaying) {
   *   await embed.pause();
   * } else {
   *   await embed.play();
   * }
   *
   * @see {@link play} - Start or resume playback
   * @see {@link stop} - Stop and reset playback
   */
  pause(): Promise<void> {
    return this.call('pause') as Promise<void>;
  }

  /**
   * Stop playback
   *
   * Stops the score playback and resets the playback position to the beginning
   * of the score. Unlike `pause()`, the playback position is not maintained.
   *
   * @returns A promise that resolves when playback has been stopped
   * @throws {Error} If no score is loaded or playback cannot be stopped
   *
   * @example
   * // Stop playback
   * await embed.stop();
   *
   * @example
   * // Stop and restart from beginning
   * await embed.stop();
   * await embed.play(); // Starts from beginning
   *
   * @see {@link play} - Start playback
   * @see {@link pause} - Pause playback
   */
  stop(): Promise<void> {
    return this.call('stop') as Promise<void>;
  }

  /**
   * Mute playback
   *
   * Mutes all audio output from the score playback. The playback continues
   * but without sound. This is equivalent to setting the master volume to 0
   * but preserves the previous volume setting.
   *
   * @returns A promise that resolves when audio has been muted
   * @throws {Error} If muting fails
   *
   * @example
   * // Mute audio
   * await embed.mute();
   *
   * @example
   * // Mute during playback
   * await embed.play();
   * await embed.mute();
   *
   * @see {@link setMasterVolume} - Set master volume level
   * @note There is no unmute method; use setMasterVolume to restore audio
   */
  mute(): Promise<void> {
    return this.call('mute') as Promise<void>;
  }

  /**
   * Get the current master volume
   *
   * Retrieves the current master volume level for score playback.
   *
   * @returns A promise that resolves with the volume level (0-100)
   * @throws {Error} If the volume cannot be retrieved
   *
   * @example
   * // Get current volume
   * const volume = await embed.getMasterVolume();
   * console.log(`Current volume: ${volume}%`);
   *
   * @see {@link setMasterVolume} - Set the master volume
   */
  getMasterVolume(): Promise<number> {
    return this.call('getMasterVolume') as Promise<number>;
  }

  /**
   * Set the master volume
   *
   * Sets the master volume level for score playback. This affects all parts
   * proportionally based on their individual volume settings.
   *
   * @param parameters - Volume settings
   * @returns A promise that resolves when the volume has been set
   * @throws {Error} If the volume value is invalid or cannot be set
   *
   * @example
   * // Set volume to 50%
   * await embed.setMasterVolume({ volume: 50 });
   *
   * @example
   * // Mute audio
   * await embed.setMasterVolume({ volume: 0 });
   *
   * @example
   * // Maximum volume
   * await embed.setMasterVolume({ volume: 100 });
   *
   * @see {@link getMasterVolume} - Get the current master volume
   */
  setMasterVolume(parameters: { volume: number }): Promise<void> {
    return this.call('setMasterVolume', parameters) as Promise<void>;
  }

  /**
   * Get the volume of a specific part
   *
   * Retrieves the current volume level for a specific instrument part in the score.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: The unique identifier of the part
   * @returns A promise that resolves with the part's volume level (0-100)
   * @throws {Error} If the part UUID is invalid or volume cannot be retrieved
   *
   * @example
   * // Get volume for a specific part
   * const parts = await embed.getParts();
   * const violinVolume = await embed.getPartVolume({
   *   partUuid: parts[0].uuid
   * });
   *
   * @see {@link setPartVolume} - Set the volume for a part
   * @see {@link getParts} - Get all parts information
   */
  getPartVolume(parameters: { partUuid: string }): Promise<number> {
    return this.call('getPartVolume', parameters) as Promise<number>;
  }

  /**
   * Set the volume of a specific part
   *
   * Sets the volume level for a specific instrument part in the score. Part volumes
   * are independent but affected by the master volume.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: The unique identifier of the part
   *   - `volume`: Volume level (0-100, where 0 is muted and 100 is maximum)
   * @returns A promise that resolves when the volume has been set
   * @throws {Error} If the part UUID or volume value is invalid
   *
   * @example
   * // Set violin part to 75% volume
   * const parts = await embed.getParts();
   * await embed.setPartVolume({
   *   partUuid: parts[0].uuid,
   *   volume: 75
   * });
   *
   * @example
   * // Mute the bass part
   * await embed.setPartVolume({
   *   partUuid: bassPartUuid,
   *   volume: 0
   * });
   *
   * @see {@link getPartVolume} - Get the volume for a part
   * @see {@link mutePart} - Mute a part
   */
  setPartVolume(parameters: { partUuid: string; volume: number }): Promise<void> {
    return this.call('setPartVolume', parameters) as Promise<void>;
  }

  /**
   * Mute a specific part
   *
   * Mutes the audio output for a specific instrument part. The part's volume
   * setting is preserved and can be restored using `unmutePart()`.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: The unique identifier of the part to mute
   * @returns A promise that resolves when the part has been muted
   * @throws {Error} If the part UUID is invalid or muting fails
   *
   * @example
   * // Mute the drums part
   * const parts = await embed.getParts();
   * const drumsPart = parts.find(p => p.instrument === 'drums');
   * await embed.mutePart({ partUuid: drumsPart.uuid });
   *
   * @see {@link unmutePart} - Unmute a part
   * @see {@link setPartVolume} - Set part volume to 0 (alternative)
   */
  mutePart(parameters: { partUuid: string }): Promise<void> {
    return this.call('mutePart', parameters) as Promise<void>;
  }

  /**
   * Unmute a specific part
   *
   * Restores the audio output for a previously muted part. The part returns
   * to its previous volume level before it was muted.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: The unique identifier of the part to unmute
   * @returns A promise that resolves when the part has been unmuted
   * @throws {Error} If the part UUID is invalid or unmuting fails
   *
   * @example
   * // Unmute a previously muted part
   * await embed.unmutePart({ partUuid: drumsPart.uuid });
   *
   * @see {@link mutePart} - Mute a part
   */
  unmutePart(parameters: { partUuid: string }): Promise<void> {
    return this.call('unmutePart', parameters) as Promise<void>;
  }

  /**
   * Enable solo mode for a part
   *
   * Enables solo mode for a specific part, which mutes all other parts while
   * keeping the selected part audible. Multiple parts can be in solo mode
   * simultaneously.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: The unique identifier of the part to solo
   * @returns A promise that resolves when solo mode has been enabled
   * @throws {Error} If the part UUID is invalid or solo mode cannot be set
   *
   * @example
   * // Solo the violin part
   * const parts = await embed.getParts();
   * const violinPart = parts.find(p => p.instrument === 'violin');
   * await embed.setPartSoloMode({ partUuid: violinPart.uuid });
   *
   * @example
   * // Solo multiple parts
   * await embed.setPartSoloMode({ partUuid: violinUuid });
   * await embed.setPartSoloMode({ partUuid: celloUuid });
   *
   * @see {@link unsetPartSoloMode} - Disable solo mode
   * @see {@link getPartSoloMode} - Check solo mode status
   */
  setPartSoloMode(parameters: { partUuid: string }): Promise<void> {
    return this.call('setPartSoloMode', parameters) as Promise<void>;
  }

  /**
   * Disable solo mode for a part
   *
   * Disables solo mode for a specific part. If this was the only part in solo
   * mode, all parts return to their normal volume/mute states. If other parts
   * remain in solo mode, this part will be muted.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: The unique identifier of the part
   * @returns A promise that resolves when solo mode has been disabled
   * @throws {Error} If the part UUID is invalid or solo mode cannot be unset
   *
   * @example
   * // Remove solo from a part
   * await embed.unsetPartSoloMode({ partUuid: violinPart.uuid });
   *
   * @see {@link setPartSoloMode} - Enable solo mode
   * @see {@link getPartSoloMode} - Check solo mode status
   */
  unsetPartSoloMode(parameters: { partUuid: string }): Promise<void> {
    return this.call('unsetPartSoloMode', parameters) as Promise<void>;
  }

  /**
   * Get the solo mode status of a part
   *
   * Checks whether a specific part is currently in solo mode.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: The unique identifier of the part
   * @returns A promise that resolves with true if solo mode is enabled, false otherwise
   * @throws {Error} If the part UUID is invalid
   *
   * @example
   * // Check if violin is in solo mode
   * const isSolo = await embed.getPartSoloMode({
   *   partUuid: violinPart.uuid
   * });
   * if (isSolo) {
   *   console.log('Violin is in solo mode');
   * }
   *
   * @see {@link setPartSoloMode} - Enable solo mode
   * @see {@link unsetPartSoloMode} - Disable solo mode
   */
  getPartSoloMode(parameters: { partUuid: string }): Promise<boolean> {
    return this.call('getPartSoloMode', parameters) as Promise<boolean>;
  }

  /**
   * Get the reverb level of a part
   *
   * Retrieves the current reverb (reverberation) effect level for a specific
   * instrument part. Reverb adds spatial depth and ambience to the sound.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: The unique identifier of the part
   * @returns A promise that resolves with the reverb level (0-100)
   * @throws {Error} If the part UUID is invalid or reverb cannot be retrieved
   *
   * @example
   * // Get reverb level for piano part
   * const parts = await embed.getParts();
   * const pianoPart = parts.find(p => p.instrument === 'piano');
   * const reverb = await embed.getPartReverb({
   *   partUuid: pianoPart.uuid
   * });
   * console.log(`Piano reverb: ${reverb}%`);
   *
   * @see {@link setPartReverb} - Set the reverb level
   */
  getPartReverb(parameters: { partUuid: string }): Promise<number> {
    return this.call('getPartReverb', parameters) as Promise<number>;
  }

  /**
   * Set the reverb level of a part
   *
   * Sets the reverb (reverberation) effect level for a specific instrument part.
   * Higher values create more spacious, ambient sound.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: The unique identifier of the part
   *   - `reverberation`: Reverb level (0-100, where 0 is dry and 100 is maximum reverb)
   * @returns A promise that resolves when the reverb has been set
   * @throws {Error} If the part UUID or reverb value is invalid
   *
   * @example
   * // Add subtle reverb to piano
   * await embed.setPartReverb({
   *   partUuid: pianoPart.uuid,
   *   reverberation: 30
   * });
   *
   * @example
   * // Remove reverb (dry sound)
   * await embed.setPartReverb({
   *   partUuid: pianoPart.uuid,
   *   reverberation: 0
   * });
   *
   * @see {@link getPartReverb} - Get the current reverb level
   */
  setPartReverb(parameters: { partUuid: string; reverberation: number }): Promise<void> {
    return this.call('setPartReverb', parameters) as Promise<void>;
  }

  /**
   * Configure an audio or video track
   *
   * Sets up a new audio or video track to synchronize with the score playback.
   * This allows you to play backing tracks, reference recordings, or video
   * alongside the score.
   *
   * @param parameters - Track configuration object (see ScoreTrackConfiguration type)
   * @returns A promise that resolves when the track has been configured
   * @throws {Error} If the track configuration is invalid
   *
   * @example
   * // Configure an audio backing track
   * await embed.setTrack({
   *   id: 'backing-track-1',
   *   type: 'audio',
   *   url: 'https://example.com/backing-track.mp3',
   *   synchronizationPoints: [
   *     { type: 'measure', measure: 0, time: 0 },
   *     { type: 'measure', measure: 16, time: 32.5 }
   *   ]
   * });
   *
   * @see {@link useTrack} - Enable a configured track
   * @see {@link seekTrackTo} - Seek to a position in the track
   */
  setTrack(parameters: ScoreTrackConfiguration): Promise<void> {
    return this.call('setTrack', parameters as unknown as Record<string, unknown>) as Promise<void>;
  }

  /**
   * Enable a previously configured track
   *
   * Activates a track that was previously configured with `setTrack()`. Only one
   * track can be active at a time.
   *
   * @param parameters - Object containing:
   *   - `id`: The identifier of the track to enable
   * @returns A promise that resolves when the track has been enabled
   * @throws {Error} If the track ID is invalid or track cannot be enabled
   *
   * @example
   * // Enable a configured backing track
   * await embed.useTrack({ id: 'backing-track-1' });
   *
   * @example
   * // Switch between multiple tracks
   * await embed.useTrack({ id: 'practice-tempo' });
   * // Later...
   * await embed.useTrack({ id: 'full-tempo' });
   *
   * @see {@link setTrack} - Configure a new track
   */
  useTrack(parameters: { id: string }): Promise<void> {
    return this.call('useTrack', parameters) as Promise<void>;
  }

  /**
   * Seek to a position in the audio track
   *
   * Moves the playback position of the currently active audio/video track to
   * a specific time. This is useful for synchronizing with score playback or
   * jumping to specific sections.
   *
   * @param parameters - Object containing:
   *   - `time`: Time position in seconds
   * @returns A promise that resolves when seeking is complete
   * @throws {Error} If no track is active or seeking fails
   *
   * @example
   * // Seek to 30 seconds
   * await embed.seekTrackTo({ time: 30 });
   *
   * @example
   * // Seek to beginning
   * await embed.seekTrackTo({ time: 0 });
   *
   * @see {@link setTrack} - Configure a track
   * @see {@link useTrack} - Enable a track
   */
  seekTrackTo(parameters: { time: number }): Promise<void> {
    return this.call('seekTrackTo', parameters) as Promise<void>;
  }

  /**
   * Print the score
   *
   * Opens the browser's print dialog to print the currently loaded score. The score
   * is formatted for optimal printing with proper page breaks and sizing.
   *
   * @returns A promise that resolves when the print dialog has been opened
   * @throws {Error} If no score is loaded or printing cannot be initiated
   *
   * @example
   * // Print the current score
   * await embed.print();
   *
   * @example
   * // Add print button
   * document.getElementById('printBtn').addEventListener('click', () => {
   *   embed.print();
   * });
   *
   * @note The actual printing is controlled by the browser's print dialog
   */
  print(): Promise<void> {
    return this.call('print') as Promise<void>;
  }

  /**
   * Get the current zoom ratio
   *
   * Retrieves the current zoom level of the score display. The zoom level affects
   * how large the notation appears on screen.
   *
   * @returns A promise that resolves with the zoom ratio (0.5 to 3)
   * @throws {Error} If the zoom level cannot be retrieved
   *
   * @example
   * // Get current zoom level
   * const zoom = await embed.getZoom();
   * console.log(`Current zoom: ${zoom * 100}%`);
   *
   * @see {@link setZoom} - Set the zoom level
   * @see {@link getAutoZoom} - Check if auto-zoom is enabled
   */
  getZoom(): Promise<number> {
    return this.call('getZoom') as Promise<number>;
  }

  /**
   * Set the zoom ratio
   *
   * Sets a specific zoom level for the score display. Setting a manual zoom level
   * automatically disables auto-zoom mode.
   *
   * @param zoom - The zoom ratio (0.5 to 3)
   *   - 0.5 = 50% (minimum zoom)
   *   - 1 = 100% (normal size)
   *   - 3 = 300% (maximum zoom)
   * @returns A promise that resolves with the actual zoom ratio applied
   * @throws {Error} If the zoom value is outside the valid range
   *
   * @example
   * // Set zoom to 150%
   * await embed.setZoom(1.5);
   *
   * @example
   * // Zoom in/out buttons
   * const zoomIn = async () => {
   *   const current = await embed.getZoom();
   *   await embed.setZoom(Math.min(current + 0.1, 3));
   * };
   *
   * @see {@link getZoom} - Get current zoom level
   * @see {@link setAutoZoom} - Enable automatic zoom
   */
  setZoom(zoom: number): Promise<number> {
    return this.call('setZoom', zoom) as Promise<number>;
  }

  /**
   * Get the auto-zoom status
   *
   * Checks whether auto-zoom mode is currently enabled. When auto-zoom is active,
   * the score automatically adjusts its zoom level to fit the available space.
   *
   * @returns A promise that resolves with true if auto-zoom is enabled, false otherwise
   * @throws {Error} If the status cannot be retrieved
   *
   * @example
   * // Check auto-zoom status
   * const isAutoZoom = await embed.getAutoZoom();
   * if (isAutoZoom) {
   *   console.log('Score will auto-fit to container');
   * }
   *
   * @see {@link setAutoZoom} - Enable or disable auto-zoom
   */
  getAutoZoom(): Promise<boolean> {
    return this.call('getAutoZoom') as Promise<boolean>;
  }

  /**
   * Enable or disable auto-zoom
   *
   * Controls the auto-zoom feature. When enabled, the score automatically adjusts
   * its zoom level to fit the available container width. When disabled, the zoom
   * level remains fixed at the last set value.
   *
   * @param state - true to enable auto-zoom, false to disable
   * @returns A promise that resolves with the new auto-zoom state
   * @throws {Error} If auto-zoom cannot be toggled
   *
   * @example
   * // Enable auto-zoom
   * await embed.setAutoZoom(true);
   *
   * @example
   * // Disable auto-zoom and set fixed zoom
   * await embed.setAutoZoom(false);
   * await embed.setZoom(1.2);
   *
   * @see {@link getAutoZoom} - Check current auto-zoom status
   * @see {@link setZoom} - Set a specific zoom level
   */
  setAutoZoom(state: boolean): Promise<boolean> {
    return this.call('setAutoZoom', state) as Promise<boolean>;
  }

  /**
   * Set focus to the score
   *
   * Gives keyboard focus to the score iframe, allowing keyboard shortcuts and
   * navigation to work. This is useful when embedding multiple interactive elements
   * on a page.
   *
   * @returns A promise that resolves when focus has been set
   *
   * @example
   * // Focus score for keyboard interaction
   * await embed.focusScore();
   *
   * @example
   * // Focus score when user clicks a button
   * document.getElementById('editBtn').addEventListener('click', () => {
   *   embed.focusScore();
   * });
   */
  focusScore(): Promise<void> {
    return this.call('focusScore') as Promise<void>;
  }

  /**
   * Get the cursor position
   *
   * Retrieves the current position of the cursor in the score, including the part,
   * measure, voice, and note location.
   *
   * @returns A promise that resolves with the cursor position object
   * @throws {Error} If cursor position cannot be retrieved
   *
   * @example
   * // Get current cursor position
   * const pos = await embed.getCursorPosition();
   * console.log(`Cursor at measure ${pos.measureIdx + 1}`);
   *
   * @see {@link setCursorPosition} - Set cursor position
   * @see {@link goLeft} - Move cursor left
   * @see {@link goRight} - Move cursor right
   */
  getCursorPosition(): Promise<NoteCursorPosition> {
    return this.call('getCursorPosition') as unknown as Promise<NoteCursorPosition>;
  }

  /**
   * Set the cursor position
   *
   * Moves the cursor to a specific position in the score. You can specify any
   * combination of part, measure, voice, staff, and note indices. Unspecified
   * values remain at their current position.
   *
   * @param position - New cursor position with optional fields:
   *   - `partIdx`: Target part index (optional)
   *   - `measureIdx`: Target measure index (optional)
   *   - `voiceIdx`: Target voice index (optional)
   *   - `noteIdx`: Target note index (optional)
   *   - `staffIdx`: Target staff index (optional)
   * @returns A promise that resolves when the cursor has been moved
   * @throws {Error} If the position is invalid or cursor cannot be moved
   *
   * @example
   * // Move to beginning of measure 5
   * await embed.setCursorPosition({
   *   measureIdx: 4,  // 0-based index
   *   noteIdx: 0
   * });
   *
   * @example
   * // Move to second voice of current measure
   * await embed.setCursorPosition({ voiceIdx: 1 });
   *
   * @see {@link getCursorPosition} - Get current position
   */
  setCursorPosition(position: NoteCursorPositionOptional): Promise<void> {
    return this.call('setCursorPosition', position as Record<string, unknown>) as Promise<void>;
  }

  /**
   * Get information about all parts
   *
   * Retrieves detailed information about all instrument parts in the score,
   * including their names, instruments, and unique identifiers.
   *
   * @returns A promise that resolves with an array of part configurations
   * @throws {Error} If no score is loaded or parts cannot be retrieved
   *
   * @example
   * // Get all parts
   * const parts = await embed.getParts();
   * parts.forEach(part => {
   *   console.log(`${part.name}: ${part.uuid}`);
   * });
   *
   * @example
   * // Find specific instrument
   * const parts = await embed.getParts();
   * const violin = parts.find(p => p.instrument === 'violin');
   *
   * @see {@link getDisplayedParts} - Get currently visible parts
   * @see {@link setDisplayedParts} - Choose which parts to display
   */
  getParts(): Promise<PartConfiguration[]> {
    return this.call('getParts') as Promise<PartConfiguration[]>;
  }

  /**
   * Get the currently displayed parts
   *
   * Retrieves information about which parts are currently visible in the score.
   * Some parts may be hidden for focused practice or simplified viewing.
   *
   * @returns A promise that resolves with an array of currently displayed part configurations
   * @throws {Error} If displayed parts cannot be retrieved
   *
   * @example
   * // Check which parts are visible
   * const displayedParts = await embed.getDisplayedParts();
   * console.log(`Showing ${displayedParts.length} parts`);
   *
   * @see {@link getParts} - Get all parts in the score
   * @see {@link setDisplayedParts} - Change which parts are visible
   */
  getDisplayedParts(): Promise<PartConfiguration[]> {
    return this.call('getDisplayedParts') as Promise<PartConfiguration[]>;
  }

  /**
   * Set which parts to display
   *
   * Controls which instrument parts are visible in the score. Parts can be
   * identified by their UUID, index, name, or abbreviation. Hidden parts
   * are not displayed but still play during playback unless muted.
   *
   * @param parts - Array of part identifiers. Each can be:
   *   - UUID (recommended): The unique identifier
   *   - Index: Numeric position (0-based)
   *   - Name: Full part name (e.g., "Violin")
   *   - Abbreviation: Short name (e.g., "Vln")
   * @returns A promise that resolves when parts visibility has been updated
   * @throws {Error} If part identifiers are invalid
   *
   * @example
   * // Show only violin and piano parts by UUID
   * const parts = await embed.getParts();
   * const violin = parts.find(p => p.instrument === 'violin');
   * const piano = parts.find(p => p.instrument === 'piano');
   * await embed.setDisplayedParts([violin.uuid, piano.uuid]);
   *
   * @example
   * // Show parts by index
   * await embed.setDisplayedParts(['0', '2', '3']);
   *
   * @example
   * // Show all parts
   * const allParts = await embed.getParts();
   * await embed.setDisplayedParts(allParts.map(p => p.uuid));
   *
   * @see {@link getParts} - Get all available parts
   * @see {@link getDisplayedParts} - Check which parts are visible
   */
  setDisplayedParts(parts: string[]): Promise<void> {
    return this.call('setDisplayedParts', parts) as Promise<void>;
  }

  /**
   * Get the number of measures in the score
   *
   * Retrieves the total count of measures (bars) in the currently loaded score.
   *
   * @returns A promise that resolves with the number of measures
   * @throws {Error} If no score is loaded
   *
   * @example
   * // Get measure count
   * const measureCount = await embed.getNbMeasures();
   * console.log(`This score has ${measureCount} measures`);
   *
   * @see {@link getMeasuresUuids} - Get measure identifiers
   * @see {@link getMeasureDetails} - Get detailed measure information
   */
  getNbMeasures(): Promise<number> {
    return this.call('getNbMeasures') as Promise<number>;
  }

  /**
   * Get the measure UUIDs of the score
   *
   * Retrieves the unique identifiers for all measures in the score. These UUIDs
   * can be used to reference specific measures in other API calls.
   *
   * @returns A promise that resolves with an array of measure UUIDs in order
   * @throws {Error} If no score is loaded
   *
   * @example
   * // Get all measure UUIDs
   * const measureUuids = await embed.getMeasuresUuids();
   * console.log(`First measure UUID: ${measureUuids[0]}`);
   *
   * @see {@link getNbMeasures} - Get the total number of measures
   * @see {@link getMeasureDetails} - Get details for a specific measure
   */
  getMeasuresUuids(): Promise<string[]> {
    return this.call('getMeasuresUuids') as Promise<string[]>;
  }

  /**
   * Get detailed measure information
   *
   * Retrieves comprehensive information about the current measure at the cursor
   * position, including time signature, key signature, tempo, and other properties.
   *
   * @returns A promise that resolves with the measure details
   * @throws {Error} If no score is loaded or details cannot be retrieved
   *
   * @example
   * // Get current measure details
   * const details = await embed.getMeasureDetails();
   * console.log(`Time signature: ${details.time.beats}/${details.time['beat-type']}`);
   * console.log(`Key signature: ${details.key.fifths} sharps/flats`);
   * console.log(`Tempo: ${details.tempo.bpm} BPM`);
   *
   * @see {@link getNbMeasures} - Get measure count
   * @see {@link getMeasuresUuids} - Get measure identifiers
   */
  getMeasureDetails(): Promise<MeasureDetails> {
    return this.call('getMeasureDetails') as Promise<MeasureDetails>;
  }

  /**
   * Get the number of parts in the score
   *
   * Retrieves the total count of instrument parts in the currently loaded score.
   *
   * @returns A promise that resolves with the number of parts
   * @throws {Error} If no score is loaded
   *
   * @example
   * // Get part count
   * const partCount = await embed.getNbParts();
   * console.log(`Score has ${partCount} instruments`);
   *
   * @see {@link getParts} - Get detailed part information
   * @see {@link getPartsUuids} - Get part identifiers
   */
  getNbParts(): Promise<number> {
    return this.call('getNbParts') as Promise<number>;
  }

  /**
   * Get the part UUIDs of the score
   *
   * Retrieves the unique identifiers for all parts in the score. These UUIDs
   * are used to reference specific parts in volume, mute, and other part-specific
   * operations.
   *
   * @returns A promise that resolves with an array of part UUIDs in order
   * @throws {Error} If no score is loaded
   *
   * @example
   * // Get all part UUIDs
   * const partUuids = await embed.getPartsUuids();
   * // Mute the first part
   * await embed.mutePart({ partUuid: partUuids[0] });
   *
   * @see {@link getNbParts} - Get the total number of parts
   * @see {@link getParts} - Get detailed part information
   */
  getPartsUuids(): Promise<string[]> {
    return this.call('getPartsUuids') as Promise<string[]>;
  }

  /**
   * Get voice UUIDs for a specific measure
   *
   * Retrieves the unique identifiers of all voices present in a specific measure
   * of a part. Voices represent independent melodic lines within a part.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: UUID of the part
   *   - `measureUuid`: UUID of the measure
   * @returns A promise that resolves with an array of voice UUIDs
   * @throws {Error} If the part or measure UUID is invalid
   *
   * @example
   * // Get voices in first measure of piano part
   * const parts = await embed.getParts();
   * const measures = await embed.getMeasuresUuids();
   * const voices = await embed.getMeasureVoicesUuids({
   *   partUuid: parts[0].uuid,
   *   measureUuid: measures[0]
   * });
   * console.log(`Found ${voices.length} voices`);
   *
   * @see {@link getMeasureNbNotes} - Count notes in a voice
   */
  getMeasureVoicesUuids(parameters: { partUuid: string; measureUuid: string }): Promise<string[]> {
    return this.call('getMeasureVoicesUuids', parameters) as Promise<string[]>;
  }

  /**
   * Get the number of notes in a voice
   *
   * Counts the total number of notes (including rests) in a specific voice
   * within a measure. This is useful for iterating through notes or determining
   * voice complexity.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: UUID of the part
   *   - `measureUuid`: UUID of the measure
   *   - `voiceUuid`: UUID of the voice
   * @returns A promise that resolves with the number of notes
   * @throws {Error} If any UUID is invalid
   *
   * @example
   * // Count notes in first voice
   * const noteCount = await embed.getMeasureNbNotes({
   *   partUuid: partUuid,
   *   measureUuid: measureUuid,
   *   voiceUuid: voiceUuids[0]
   * });
   *
   * @see {@link getNoteData} - Get details about specific notes
   * @see {@link getMeasureVoicesUuids} - Get voice UUIDs
   */
  getMeasureNbNotes(parameters: {
    partUuid: string;
    measureUuid: string;
    voiceUuid: string;
  }): Promise<number> {
    return this.call('getMeasureNbNotes', parameters) as Promise<number>;
  }

  /**
   * Get information about a specific note
   *
   * Retrieves detailed information about a note at a specific position, including
   * pitch, duration, articulations, and other musical properties.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: UUID of the part
   *   - `measureUuid`: UUID of the measure
   *   - `voiceUuid`: UUID of the voice
   *   - `noteIdx`: Index of the note (0-based)
   * @returns A promise that resolves with the note details
   * @throws {Error} If the position is invalid or note not found
   *
   * @example
   * // Get first note details
   * const noteData = await embed.getNoteData({
   *   partUuid: partUuid,
   *   measureUuid: measureUuid,
   *   voiceUuid: voiceUuid,
   *   noteIdx: 0
   * });
   * console.log(`Note: ${noteData.pitch}`);
   *
   * @see {@link getMeasureNbNotes} - Get total notes in voice
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
   * Convert playback position to note index
   *
   * Finds the note index that corresponds to a specific playback position.
   * This is useful for synchronizing visual elements with audio playback.
   *
   * @param parameters - Object containing:
   *   - `partUuid`: UUID of the part
   *   - `voiceUuid`: UUID of the voice
   *   - `playbackPosition`: Position object with measure and beat information
   * @returns A promise that resolves with the note index (0-based)
   * @throws {Error} If the position cannot be mapped to a note
   *
   * @example
   * // Find note at current playback position
   * const noteIdx = await embed.playbackPositionToNoteIdx({
   *   partUuid: partUuid,
   *   voiceUuid: voiceUuid,
   *   playbackPosition: currentPosition
   * });
   *
   * @see {@link getNoteData} - Get note details at index
   */
  playbackPositionToNoteIdx(parameters: {
    partUuid: string;
    voiceUuid: string;
    playbackPosition: PlaybackPosition;
  }): Promise<number> {
    return this.call('playbackPositionToNoteIdx', parameters) as Promise<number>;
  }

  /**
   * Get note details at cursor position
   *
   * Retrieves detailed information about the note at the current cursor position,
   * including pitch, duration, and musical attributes.
   *
   * @returns A promise that resolves with the note details at cursor
   * @throws {Error} If no note is at the cursor position
   *
   * @example
   * // Get details of note at cursor
   * const noteDetails = await embed.getNoteDetails();
   * console.log(`Current note: ${noteDetails.pitch}`);
   *
   * @see {@link getCursorPosition} - Get cursor position
   * @see {@link getNoteData} - Get note at specific position
   */
  getNoteDetails(): Promise<NoteDetails> {
    return this.call('getNoteDetails') as Promise<NoteDetails>;
  }

  /**
   * Move cursor left
   *
   * Moves the cursor to the previous item in the score (note, rest, or grace note).
   * Navigation follows the reading order of the score.
   *
   * @param mute - If false, plays the note at the new cursor position (default: false)
   * @returns A promise that resolves when the cursor has moved
   * @throws {Error} If cursor cannot move (e.g., at beginning of score)
   *
   * @example
   * // Move left silently
   * await embed.goLeft(true);
   *
   * @example
   * // Move left and play the note
   * await embed.goLeft(false);
   *
   * @see {@link goRight} - Move cursor right
   * @see {@link setCursorPosition} - Set specific position
   */
  goLeft(mute: boolean = false): Promise<void> {
    return this.call('goLeft', { mute }) as Promise<void>;
  }

  /**
   * Move cursor right
   *
   * Moves the cursor to the next item in the score (note, rest, or grace note).
   * Navigation follows the reading order of the score.
   *
   * @param mute - If false, plays the note at the new cursor position (default: false)
   * @returns A promise that resolves when the cursor has moved
   * @throws {Error} If cursor cannot move (e.g., at end of score)
   *
   * @example
   * // Move right and play the note
   * await embed.goRight();
   *
   * @example
   * // Navigate through score silently
   * for (let i = 0; i < 4; i++) {
   *   await embed.goRight(true);
   * }
   *
   * @see {@link goLeft} - Move cursor left
   * @see {@link setCursorPosition} - Set specific position
   */
  goRight(mute: boolean = false): Promise<void> {
    return this.call('goRight', { mute }) as Promise<void>;
  }

  /**
   * Get the metronome mode
   *
   * Retrieves the current metronome setting, which controls when the metronome
   * clicks are played during playback.
   *
   * @returns A promise that resolves with the metronome mode
   * @throws {Error} If metronome mode cannot be retrieved
   *
   * @example
   * // Check current metronome setting
   * const mode = await embed.getMetronomeMode();
   * switch(mode) {
   *   case 0: console.log('Count-in only'); break;
   *   case 1: console.log('Continuous'); break;
   *   case 2: console.log('Disabled'); break;
   * }
   *
   * @see {@link setMetronomeMode} - Change metronome mode
   */
  getMetronomeMode(): Promise<MetronomeMode> {
    return this.call('getMetronomeMode') as Promise<MetronomeMode>;
  }

  /**
   * Set the metronome mode
   *
   * Controls when metronome clicks are played during score playback.
   *
   * @param mode - The metronome mode:
   *   - 0: COUNT_IN - Metronome plays only during count-in before playback
   *   - 1: CONTINUOUS - Metronome plays throughout the entire playback
   *   - 2: DISABLED - Metronome is completely disabled
   * @returns A promise that resolves when the mode has been set
   * @throws {Error} If the mode value is invalid
   *
   * @example
   * // Enable continuous metronome
   * await embed.setMetronomeMode(1);
   *
   * @example
   * // Use count-in only
   * await embed.setMetronomeMode(0);
   *
   * @example
   * // Disable metronome
   * await embed.setMetronomeMode(2);
   *
   * @see {@link getMetronomeMode} - Get current mode
   */
  setMetronomeMode(mode: MetronomeMode): Promise<void> {
    return this.call('setMetronomeMode', { mode }) as Promise<void>;
  }

  /**
   * Get the playback speed
   *
   * Retrieves the current playback speed multiplier. Normal speed is 1.0.
   *
   * @returns A promise that resolves with the speed multiplier (0.2 to 2.0)
   * @throws {Error} If speed cannot be retrieved
   *
   * @example
   * // Get current playback speed
   * const speed = await embed.getPlaybackSpeed();
   * console.log(`Playing at ${speed * 100}% speed`);
   *
   * @see {@link setPlaybackSpeed} - Change playback speed
   */
  getPlaybackSpeed(): Promise<number> {
    return this.call('getPlaybackSpeed') as Promise<number>;
  }

  /**
   * Set the playback speed
   *
   * Adjusts the playback speed without affecting pitch. Useful for practice
   * at slower or faster tempos.
   *
   * @param speed - Speed multiplier (0.2 to 2.0):
   *   - 0.2: 20% speed (very slow)
   *   - 1.0: Normal speed (100%)
   *   - 2.0: Double speed (200%)
   * @returns A promise that resolves when speed has been set
   * @throws {Error} If speed is outside valid range
   *
   * @example
   * // Slow down for practice
   * await embed.setPlaybackSpeed(0.5);
   *
   * @example
   * // Return to normal speed
   * await embed.setPlaybackSpeed(1.0);
   *
   * @example
   * // Speed up playback
   * await embed.setPlaybackSpeed(1.5);
   *
   * @see {@link getPlaybackSpeed} - Get current speed
   */
  setPlaybackSpeed(speed: number): Promise<void> {
    return this.call('setPlaybackSpeed', { speed }) as Promise<void>;
  }

  /**
   * Scroll to cursor position
   *
   * Scrolls the score view to ensure the cursor is visible on screen. This is
   * useful after programmatically moving the cursor or when the cursor moves
   * out of view during navigation.
   *
   * @returns A promise that resolves when scrolling has been initiated
   * @throws {Error} If scrolling fails
   *
   * @example
   * // Move cursor and scroll to it
   * await embed.setCursorPosition({ measureIdx: 20 });
   * await embed.scrollToCursor();
   *
   * @example
   * // Ensure cursor visible after navigation
   * for (let i = 0; i < 10; i++) {
   *   await embed.goRight();
   * }
   * await embed.scrollToCursor();
   *
   * @note Scrolling is performed asynchronously and may not complete before the promise resolves
   * @see {@link setCursorPosition} - Set cursor position
   */
  scrollToCursor(): Promise<void> {
    return this.call('scrollToCursor') as Promise<void>;
  }
}

export default Embed;
