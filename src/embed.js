import './lib/compatibility';

import { normalizeElement } from './lib/dom';
import { createEmbedIframe } from './lib/embed';
import { postMessage, parseMessage } from './lib/communication';
import EmbedCallback from './lib/callback';

const embeds = new WeakMap();
const embedsReady = new WeakMap();

class Embed {
  /**
   * Create a new Flat Embed
   *
   * @param {(HTMLIFrameElement|HTMLElement|string|jQuery)} element A reference to a Flat Embed iframe or a container for the new iframe
   * @param {object} [params] Parameters for the new iframe
   * @return {Embed}
   */
  constructor(element, params = {}) {
    element = normalizeElement(element);

    // Keep a single object instance per iframe
    if (embeds.has(element)) {
      return embeds.get(element);
    }

    // Create new element iframe if needed
    if (element.nodeName !== 'IFRAME') {
      element = createEmbedIframe(element, params);
    }

    this.origin = '*';
    this.element = element;
    this.embedCallback = new EmbedCallback();

    const onReady = new Promise((resolve) => {
      // Handle incoming messages from embed
      const onMessage = (event) => {
        if (element.contentWindow !== event.source) {
          return;
        }

        if (this.origin === '*') {
          this.origin = event.origin;
        }

        // Parse inbound message
        const data = parseMessage(event.data);

        // Mark the embed as ready
        if (data.event === 'ready' || data.method === 'ping') {
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
    embedsReady.set(this, onReady);

    return this;
  }

  ready() {
    return Promise.resolve(embedsReady.get(this));
  }

  call(method, parameters={}) {
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
   * @param {string} event The name of the event.
   * @param {function} callback The function to call when receiving an event
   */
  on(event, callback) {
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
   * @param {string} event The name of the event.
   * @param {function} [callback] The function to unsubscribe
   */
  off(event, callback) {
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
   * @param {string} score The unique identifier of the score
   * @param {string} [revision] The unique identifier of the revision
   * @return {Promise}
   * @reject {ApiError} Unable to load the score
   */
  loadFlatScore(score, revision) {
    return this.call('loadFlatScore', {score, revision});
  }

  /**
   * Load a MusicXML score
   *
   * @param {string} score The MusicXML file
   * @return {Promise}
   * @reject {Error} Unable to load the score
   */
  loadMusicXML(score) {
    return this.call('loadMusicXML', score);
  }

  /**
   * Load a Flat JSON score
   *
   * @param {object|string} score The JSON of the score
   * @return {Promise}
   * @reject {Error} Unable to load the score
   */
  loadJSON(score) {
    return this.call('loadJSON', score);
  }

  /**
   * Get the score in Flat JSON format
   *
   * @return {Promise}
   * @fulfill {object} The Flat data format
   */
  getJSON() {
    return this.call('getJSON');
  }

  /**
   * Convert the displayed score in MusicXML
   *
   * @param {object} options Conversion options (`compressed`)
   * @return {Promise}
   * @fullfill {string|Uint8Array} MusicXML File
   * @reject {Error} Conversion error
   */
  getMusicXML(options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      if (typeof options !== 'object') {
        return reject(new TypeError('Options must be an object'));
      }
      this.call('getMusicXML', options).then((data) => {
        // Plain XML
        if (typeof data === 'string') {
          return resolve(data);
        }
        // Compressed, re-create Uint8Array
        return resolve(new Uint8Array(data));
      }).catch(reject);
    });
  }

  /**
   * Convert the displayed score in PNG
   *
   * @return {Promise}
   * @fullfill {Uint8Array} PNG File
   * @reject {Error} Conversion error
   */
   getPNG(options) {
     return new Promise((resolve, reject) => {
       options = options || {};
       if (typeof options !== 'object') {
         return reject(new TypeError('Options must be an object'));
       }
       this.call('getPNG', options).then((data) => {
         if (typeof data === 'string') {
           return resolve(data);
         }
         return resolve(new Uint8Array(data));
       }).catch(reject);
     });
   }

  /**
   * Convert the displayed score in MIDI
   *
   * @return {Promise}
   * @fullfill {Uint8Array} MIDI File
   * @reject {Error} Conversion error
   */
  getMIDI() {
    return this.call('getMIDI').then(data => new Uint8Array(data));
  }

  /**
   * Get the metadata of the score (for scores hosted on Flat)
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
   * @return {Promise}
   * @fullfill {object} An object containing the config of the embed
   */
   getEmbedConfig() {
     return this.call('getEmbedConfig');
   }

  /**
   * Set a config for the embed mode
   * This config can be fetched with `getEmbed()` (as `editor` value)
   * This config will be applied at the next score loading
   *
   * @param {object} editor The editor config
   * @return {Promise}
   * @fullfill {object} An object containing the config of the editor
   */
   setEditorConfig(editor) {
     return this.call('setEditorConfig', editor);
   }

  /**
   * Toggle fullscreen state
   *
   * @param {boolean} active `true` to switch on fullscreen, `false` to switch off
   * @return {Promise} Once the state changed
   */
  fullscreen(active) {
    return this.call('fullscreen', active);
  }

  /**
   * Start the playback
   *
   * @return {Promise}
   */
  play() {
    return this.call('play');
  }

  /**
   * Pause the playback
   *
   * @return {Promise}
   */
  pause() {
    return this.call('pause');
  }

  /**
   * Stop the playback
   *
   * @return {Promise}
   */
  stop() {
    return this.call('stop');
  }

  /**
   * Mute playback
   *
   * @return {Promise}
   */
  mute() {
    return this.call('mute');
  }

  /**
   * Print the score
   *
   * @return {Promise}
   */
  print() {
    return this.call('print');
  }

  /**
   * Get the current zoom ratio
   *
   * @return {Promise}
   * @fullfill {number} The current scale ratio (0.5 to 3)
   */
  getZoom() {
    return this.call('getZoom');
  }

  /**
   * Set a new zoom ratio (this will disable the zoom auto if set)
   *
   * @param {number} zoom The scale ratio (0.5 to 3)
   * @return {Promise}
   * @fullfill {number} The scale ratio applied
   */
  setZoom(zoom) {
    return this.call('setZoom', zoom);
  }

  /**
   * Get the auto-zoom
   *
   * @return {Promise}
   * @fullfill {boolean} `true` if enabled, `false` if disabled
   */
  getAutoZoom() {
    return this.call('getAutoZoom');
  }

  /**
   * Enable or disable the auto-zoom
   *
   * @param {boolean} state `true` if enabled, `false` if disabled
   * @return {Promise}
   * @fullfill {boolean} The auto-zoom mode
   */
  setAutoZoom(state) {
    return this.call('setAutoZoom', state);
  }

  /**
   * Set the focus to the score
   *
   * @return {Promise}
   */
  focusScore() {
    return this.call('focusScore');
  }

  /**
   * Get cursor position
   *
   * @return {Promise}
   * @fullfill {boolean} Current cursor position
   */
  getCursorPosition() {
    return this.call('getCursorPosition');
  }

  /**
   * Set cursor position
   *
   * @param {object} position New cursor position
   * @return {Promise}
   * @fullfill {boolean} Current cursor position
   */
  setCursorPosition(position) {
    return this.call('setCursorPosition', position);
  }
}

export default Embed;
