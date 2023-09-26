import type Embed from '../embed';
import {
  EmbedMessageReceived,
  EmbedMessageReceivedEvent,
  EmbedMessageReceivedMethod,
} from '../types';
import type { EmbedEventName } from '../types/events';

class EmbedCallback {
  embed: Embed;
  promises: Partial<
    Record<string, { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[]>
  >;
  eventCallbacks: Partial<Record<EmbedEventName, ((parameters: unknown) => void)[]>>;

  constructor(embed: Embed) {
    this.embed = embed;
    this.promises = {};
    this.eventCallbacks = {};
    return this;
  }

  pushCall(
    // NOTE: We could type this with list of public methods
    name: string,
    resolve: (value: unknown) => void,
    reject: (reason?: unknown) => void,
  ) {
    this.promises[name] = this.promises[name] || [];
    this.promises[name]!.push({ resolve, reject });
  }

  /**
   * Register a callback for a specified event
   *
   * @param event The name of the event.
   * @param callback The function to call when receiving an event
   * @return `true` if it is the first subscriber, `false otherwise`
   */
  subscribeEvent(event: EmbedEventName, callback: (parameters: unknown) => void): boolean {
    this.eventCallbacks[event] = this.eventCallbacks[event] || [];
    this.eventCallbacks[event]!.push(callback);
    return this.eventCallbacks[event]!.length === 1;
  }

  /**
   * Unregister a callback for a specified event
   *
   * @param event The name of the event.
   * @param callback The function to call when receiving an event
   * @return `true` if it is the last subscriber, `false otherwise`
   */
  unsubscribeEvent(event: EmbedEventName, callback?: (parameters: unknown) => void): boolean {
    // Was not subscribed
    if (!this.eventCallbacks[event]) {
      return false;
    }

    // If a callback is specified, unsub this one
    if (callback) {
      const idx = this.eventCallbacks[event]!.indexOf(callback);
      if (idx >= 0) {
        this.eventCallbacks[event]!.splice(idx, 1);
      }
    }
    // Unsub all
    else {
      this.eventCallbacks[event] = [];
    }

    return !callback || this.eventCallbacks[event]!.length === 0;
  }

  /**
   * Process a message received from postMessage
   *
   * @param {object} data The data received from postMessage
   */
  process(data: EmbedMessageReceived) {
    if ('method' in data && data.method) {
      this.processMethodResponse(data);
    } else if ('event' in data && data.event) {
      this.processEvent(data);
    }
  }

  /**
   * Process a method response
   *
   * @param {object} data The data received from postMessage
   */
  processMethodResponse(data: EmbedMessageReceivedMethod) {
    if (!this.promises[data.method]) {
      return;
    }
    const promise = this.promises[data.method]!.shift();
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
  processEvent(data: EmbedMessageReceivedEvent) {
    if (!this.eventCallbacks[data.event] || this.eventCallbacks[data.event]!.length === 0) {
      return;
    }
    this.eventCallbacks[data.event]!.forEach(callback => {
      callback.call(this.embed, data.parameters);
    });
  }
}

export default EmbedCallback;
