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
   * Get the score in Flat JSON format
   *
   * @return {ReadyPromise}
   * @fulfill {object} The Flat data format
   */
  getJson() {
    return this.call('getJson');
  }

  /**
   * Load a score hosted on Flat
   *
   * @param {string} score The unique identifier of the score
   * @param {string} [revision] The unique identifier of the revision
   * @return {ReadyPromise}
   * @reject {ApiError} Unable to load the new score
   */
  loadFlatScore(score, revision) {
    return this.call('loadFlatScore', {score, revision});
  }

  /**
   * Get the metadata of the score (for scores hosted on Flat)
   *
   * @return {ReadyPromise}
   * @fulfill {object} The Flat data format (result from https://flat.io/developers/api/reference/#operation/getScore)
   */
  getFlatScoreMetadata() {
    return this.call('getFlatScoreMetadata');
  }

  /**
   * Toggle fullscreen state
   *
   * @param {boolean} active `true` to switch on fullscreen, `false` to switch off
   * @return {ReadyPromise} Once the state changed
   */
  fullscreen(active) {
    return this.call('fullscreen', active);
  }

  /**
   * Start the playback
   *
   * @return {ReadyPromise}
   */
  play() {
    return this.call('play');
  }

  /**
   * Pause the playback
   *
   * @return {ReadyPromise}
   */
  pause() {
    return this.call('pause');
  }

  /**
   * Stop the playback
   *
   * @return {ReadyPromise}
   */
  stop() {
    return this.call('stop');
  }

  /**
   * Print the score
   *
   * @return {ReadyPromise}
   */
  print() {
    return this.call('print');
  }

  /**
   * Get the current zoom ratio
   *
   * @return {ReadyPromise}
   * @fullfill {number} The current scale ratio (0.5 to 3)
   */
  getZoom() {
    return this.call('getZoom');
  }

  /**
   * Set a new zoom ratio (this will disable the zoom auto if set)
   *
   * @param {number} zoom The scale ratio (0.5 to 3)
   * @return {ReadyPromise}
   * @fullfill {number} The scale ratio applied
   */
  setZoom(zoom) {
    return this.call('setZoom', zoom);
  }
}

export default Embed;
