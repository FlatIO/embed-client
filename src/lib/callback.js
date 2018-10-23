
class EmbedCallback {
  constructor(embed) {
    this.embed = embed;
    this.promises = {};
    this.eventCallbacks = {};
    return this;
  }

  pushCall(name, resolve, reject) {
    this.promises[name] = this.promises[name] || [];
    this.promises[name].push({resolve, reject});
  }

  /**
   * Register a callback for a specified event
   *
   * @param {string} event The name of the event.
   * @param {function} callback The function to call when receiving an event
   * @return {boolen} `true` if it is the first subscriber, `false otherwise`
   */
  subscribeEvent(event, callback) {
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
  unsubscribeEvent(event, callback) {
    // Was not subscribed
    if (!this.eventCallbacks[event]) {
      return false;
    }

    // If a callback is specified, unsub this one
    if (callback) {
      let idx = this.eventCallbacks[event].indexOf(callback);
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
  process(data) {
    if (data.method) {
      this.processMethodResponse(data);
    }
    else if (data.event) {
      this.processEvent(data);
    }
  }

  /**
   * Process a method response
   *
   * @param {object} data The data received from postMessage
   */
  processMethodResponse(data) {
    if (!this.promises[data.method]) {
      return;
    }
    var promise = this.promises[data.method].shift();
    if (!promise) {
      return;
    }
    if (data.error) {
      promise.reject(data.error);
    }
    else {
      promise.resolve(data.response);
    }
  }

  /**
   * Process a receieved event
   *
   * @param {object} data The data received from postMessage
   */
  processEvent(data) {
    if (!this.eventCallbacks[data.event] ||
        this.eventCallbacks[data.event].length === 0) {
      return;
    }
    this.eventCallbacks[data.event].forEach((callback) => {
      callback.call(this.embed, data.parameters);
    });
  }
}

export default EmbedCallback;
