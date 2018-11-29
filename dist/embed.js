/*! flat-embed v0.10.0 | (c) 2018 Tutteo Ltd. (Flat) | Apache-2.0 License | https://github.com/FlatIO/embed-client */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Flat = global.Flat || {}, global.Flat.Embed = factory());
}(this, (function () { 'use strict';

  if (typeof window.postMessage === 'undefined') {
    throw new Error('The Flat Embed JS API is not supported in this browser');
  }

  /**
   * Select and normalize the DOM element input
   *
   * @param {(HTMLIFrameElement|HTMLElement|string|jQuery)} element
   * @return {(HTMLIFrameElement|HTMLElement)}
   */
  function normalizeElement(element) {
    if (window.jQuery && element instanceof window.jQuery) {
      element = element[0];
    }

    // Find an element by identifier
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }

    // Check if a DOM element
    if (!(element instanceof window.HTMLElement)) {
      throw new TypeError('The first parameter must be an existing DOM element or an identifier.');
    }

    // The element is not an embed iframe?
    if (element.nodeName !== 'IFRAME') {
      // check if already present in the element
      var iframe = element.querySelector('iframe');
      if (iframe) {
        element = iframe;
      }
    }

    return element;
  }

  /**
   * Build url for the new iframe
   *
   * @param {object} parameters
   */
  function buildIframeUrl(parameters) {
    var url = parameters.baseUrl || 'https://flat-embed.com';

    // Score id or blank embed
    url += '/' + (parameters.score || 'blank');

    // Build qs parameters
    var urlParameters = Object.assign({
      jsapi: true
    }, parameters.embedParams);

    var qs = Object.keys(urlParameters).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(urlParameters[k]);
    }).join('&');

    return url + '?' + qs;
  }

  /**
   * Create an iframe inside a specified element
   *
   * @param {HTMLElement} element
   * @param {object} parameters
   */
  function createEmbedIframe(element, parameters) {
    var url = buildIframeUrl(parameters);

    var iframe = document.createElement('iframe');
    iframe.setAttribute('src', url);
    iframe.setAttribute('width', parameters.width || '100%');
    iframe.setAttribute('height', parameters.height || '100%');
    iframe.setAttribute('allowfullscreen', true);
    iframe.setAttribute('frameborder', '0');

    element.appendChild(iframe);

    return iframe;
  }

  /**
   * Send a message to the embed via postMessage
   *
   * @param {Embed} embed
   * @param {string} method The name of the method to call
   * @param {string} parameters The parameters to pass to the method
   */
  function postMessage(embed, method, parameters) {
    if (!embed.element.contentWindow || !embed.element.contentWindow.postMessage) {
      throw new Error('No `contentWindow` or `contentWindow.postMessage` avaialble on the element');
    }

    var message = {
      method: method,
      parameters: parameters
    };

    embed.element.contentWindow.postMessage(message, embed.origin);
  }

  /**
   * Parse a message received from postMessage
   *
   * @param {string|object} data The data received from postMessage
   * @return {object}
   */
  function parseMessage(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    return data;
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var EmbedCallback = function () {
    function EmbedCallback(embed) {
      classCallCheck(this, EmbedCallback);

      this.embed = embed;
      this.promises = {};
      this.eventCallbacks = {};
      return this;
    }

    createClass(EmbedCallback, [{
      key: "pushCall",
      value: function pushCall(name, resolve, reject) {
        this.promises[name] = this.promises[name] || [];
        this.promises[name].push({ resolve: resolve, reject: reject });
      }

      /**
       * Register a callback for a specified event
       *
       * @param {string} event The name of the event.
       * @param {function} callback The function to call when receiving an event
       * @return {boolen} `true` if it is the first subscriber, `false otherwise`
       */

    }, {
      key: "subscribeEvent",
      value: function subscribeEvent(event, callback) {
        this.eventCallbacks[event] = this.eventCallbacks[event] || [];
        this.eventCallbacks[event].push(callback);
        return this.eventCallbacks[event].length === 1;
      }

      /**
       * Unregister a callback for a specified event
       *
       * @param {string} event The name of the event.
       * @param {function} [callback] The function to call when receiving an event
       * @return {boolen} `true` if it is the last subscriber, `false otherwise`
       */

    }, {
      key: "unsubscribeEvent",
      value: function unsubscribeEvent(event, callback) {
        // Was not subscribed
        if (!this.eventCallbacks[event]) {
          return false;
        }

        // If a callback is specified, unsub this one
        if (callback) {
          var idx = this.eventCallbacks[event].indexOf(callback);
          if (idx >= 0) {
            this.eventCallbacks[event].splice(idx, 1);
          }
        }
        // Unsub all
        else {
            this.eventCallbacks[event] = [];
          }

        return !callback || this.eventCallbacks[event].length === 0;
      }

      /**
       * Process a message received from postMessage
       *
       * @param {object} data The data received from postMessage
       */

    }, {
      key: "process",
      value: function process(data) {
        if (data.method) {
          this.processMethodResponse(data);
        } else if (data.event) {
          this.processEvent(data);
        }
      }

      /**
       * Process a method response
       *
       * @param {object} data The data received from postMessage
       */

    }, {
      key: "processMethodResponse",
      value: function processMethodResponse(data) {
        if (!this.promises[data.method]) {
          return;
        }
        var promise = this.promises[data.method].shift();
        if (!promise) {
          return;
        }
        if (data.error) {
          promise.reject(data.error);
        } else {
          promise.resolve(data.response);
        }
      }

      /**
       * Process a receieved event
       *
       * @param {object} data The data received from postMessage
       */

    }, {
      key: "processEvent",
      value: function processEvent(data) {
        var _this = this;

        if (!this.eventCallbacks[data.event] || this.eventCallbacks[data.event].length === 0) {
          return;
        }
        this.eventCallbacks[data.event].forEach(function (callback) {
          callback.call(_this.embed, data.parameters);
        });
      }
    }]);
    return EmbedCallback;
  }();

  var embeds = new WeakMap();
  var embedsReady = new WeakMap();

  var Embed = function () {
    /**
     * Create a new Flat Embed
     *
     * @param {(HTMLIFrameElement|HTMLElement|string|jQuery)} element A reference to a Flat Embed iframe or a container for the new iframe
     * @param {object} [params] Parameters for the new iframe
     * @return {Embed}
     */
    function Embed(element) {
      var _this = this;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      classCallCheck(this, Embed);

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

      var onReady = new Promise(function (resolve) {
        // Handle incoming messages from embed
        var onMessage = function onMessage(event) {
          if (element.contentWindow !== event.source) {
            return;
          }

          if (_this.origin === '*') {
            _this.origin = event.origin;
          }

          // Parse inbound message
          var data = parseMessage(event.data);

          // Mark the embed as ready
          if (data.event === 'ready' || data.method === 'ping') {
            resolve();
            return;
          }

          // Process regular messages from the embed
          _this.embedCallback.process(data);
        };

        window.addEventListener('message', onMessage, false);
        postMessage(_this, 'ping');
      });

      embeds.set(this.element, this);
      embedsReady.set(this, onReady);

      return this;
    }

    createClass(Embed, [{
      key: 'ready',
      value: function ready() {
        return Promise.resolve(embedsReady.get(this));
      }
    }, {
      key: 'call',
      value: function call(method) {
        var _this2 = this;

        var parameters = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        return new Promise(function (resolve, reject) {
          return _this2.ready().then(function () {
            _this2.embedCallback.pushCall(method, resolve, reject);
            postMessage(_this2, method, parameters);
          });
        });
      }

      /**
       * Subscribe to a specific event
       *
       * @param {string} event The name of the event.
       * @param {function} callback The function to call when receiving an event
       */

    }, {
      key: 'on',
      value: function on(event, callback) {
        if (typeof event !== 'string') {
          throw new TypeError('An event name (string) is required');
        }
        if (typeof callback !== 'function') {
          throw new TypeError('An callback (function) is required');
        }
        if (this.embedCallback.subscribeEvent(event, callback)) {
          this.call('addEventListener', event).catch(function () {});
        }
      }

      /**
       * Unsubscribe to a specific event
       *
       * @param {string} event The name of the event.
       * @param {function} [callback] The function to unsubscribe
       */

    }, {
      key: 'off',
      value: function off(event, callback) {
        if (typeof event !== 'string') {
          throw new TypeError('An event name (string) is required');
        }
        if (this.embedCallback.unsubscribeEvent(event, callback)) {
          this.call('removeEventListener', event).catch(function () {});
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

    }, {
      key: 'loadFlatScore',
      value: function loadFlatScore(score, revision) {
        return this.call('loadFlatScore', { score: score, revision: revision });
      }

      /**
       * Load a MusicXML score
       *
       * @param {string} score The MusicXML file
       * @return {Promise}
       * @reject {Error} Unable to load the score
       */

    }, {
      key: 'loadMusicXML',
      value: function loadMusicXML(score) {
        return this.call('loadMusicXML', score);
      }

      /**
       * Load a Flat JSON score
       *
       * @param {object|string} score The JSON of the score
       * @return {Promise}
       * @reject {Error} Unable to load the score
       */

    }, {
      key: 'loadJSON',
      value: function loadJSON(score) {
        return this.call('loadJSON', score);
      }

      /**
       * Get the score in Flat JSON format
       *
       * @return {Promise}
       * @fulfill {object} The Flat data format
       */

    }, {
      key: 'getJSON',
      value: function getJSON() {
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

    }, {
      key: 'getMusicXML',
      value: function getMusicXML(options) {
        var _this3 = this;

        return new Promise(function (resolve, reject) {
          options = options || {};
          if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
            return reject(new TypeError('Options must be an object'));
          }
          _this3.call('getMusicXML', options).then(function (data) {
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

    }, {
      key: 'getPNG',
      value: function getPNG(options) {
        var _this4 = this;

        return new Promise(function (resolve, reject) {
          options = options || {};
          if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
            return reject(new TypeError('Options must be an object'));
          }
          _this4.call('getPNG', options).then(function (data) {
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

    }, {
      key: 'getMIDI',
      value: function getMIDI() {
        return this.call('getMIDI').then(function (data) {
          return new Uint8Array(data);
        });
      }

      /**
       * Get the metadata of the score (for scores hosted on Flat)
       *
       * @return {Promise}
       * @fulfill {object} The Flat data format (result from https://flat.io/developers/api/reference/#operation/getScore)
       */

    }, {
      key: 'getFlatScoreMetadata',
      value: function getFlatScoreMetadata() {
        return this.call('getFlatScoreMetadata');
      }

      /**
       * Get the whole embed config
       *
       * @return {Promise}
       * @fullfill {object} An object containing the config of the embed
       */

    }, {
      key: 'getEmbedConfig',
      value: function getEmbedConfig() {
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

    }, {
      key: 'setEditorConfig',
      value: function setEditorConfig(editor) {
        return this.call('setEditorConfig', editor);
      }

      /**
       * Toggle fullscreen state
       *
       * @param {boolean} active `true` to switch on fullscreen, `false` to switch off
       * @return {Promise} Once the state changed
       */

    }, {
      key: 'fullscreen',
      value: function fullscreen(active) {
        return this.call('fullscreen', active);
      }

      /**
       * Start the playback
       *
       * @return {Promise}
       */

    }, {
      key: 'play',
      value: function play() {
        return this.call('play');
      }

      /**
       * Pause the playback
       *
       * @return {Promise}
       */

    }, {
      key: 'pause',
      value: function pause() {
        return this.call('pause');
      }

      /**
       * Stop the playback
       *
       * @return {Promise}
       */

    }, {
      key: 'stop',
      value: function stop() {
        return this.call('stop');
      }

      /**
       * Mute playback
       *
       * @return {Promise}
       */

    }, {
      key: 'mute',
      value: function mute() {
        return this.call('mute');
      }

      /**
       * Print the score
       *
       * @return {Promise}
       */

    }, {
      key: 'print',
      value: function print() {
        return this.call('print');
      }

      /**
       * Get the current zoom ratio
       *
       * @return {Promise}
       * @fullfill {number} The current scale ratio (0.5 to 3)
       */

    }, {
      key: 'getZoom',
      value: function getZoom() {
        return this.call('getZoom');
      }

      /**
       * Set a new zoom ratio (this will disable the zoom auto if set)
       *
       * @param {number} zoom The scale ratio (0.5 to 3)
       * @return {Promise}
       * @fullfill {number} The scale ratio applied
       */

    }, {
      key: 'setZoom',
      value: function setZoom(zoom) {
        return this.call('setZoom', zoom);
      }

      /**
       * Get the auto-zoom
       *
       * @return {Promise}
       * @fullfill {boolean} `true` if enabled, `false` if disabled
       */

    }, {
      key: 'getAutoZoom',
      value: function getAutoZoom() {
        return this.call('getAutoZoom');
      }

      /**
       * Enable or disable the auto-zoom
       *
       * @param {boolean} state `true` if enabled, `false` if disabled
       * @return {Promise}
       * @fullfill {boolean} The auto-zoom mode
       */

    }, {
      key: 'setAutoZoom',
      value: function setAutoZoom(state) {
        return this.call('setAutoZoom', state);
      }

      /**
       * Set the focus to the score
       *
       * @return {Promise}
       */

    }, {
      key: 'focusScore',
      value: function focusScore() {
        return this.call('focusScore');
      }

      /**
       * Get cursor position
       *
       * @return {Promise}
       * @fullfill {boolean} Current cursor position
       */

    }, {
      key: 'getCursorPosition',
      value: function getCursorPosition() {
        return this.call('getCursorPosition');
      }

      /**
       * Set cursor position
       *
       * @param {object} position New cursor position
       * @return {Promise}
       * @fullfill {boolean} Current cursor position
       */

    }, {
      key: 'setCursorPosition',
      value: function setCursorPosition(position) {
        return this.call('setCursorPosition', position);
      }
    }]);
    return Embed;
  }();

  return Embed;

})));

//# sourceMappingURL=embed.js.map