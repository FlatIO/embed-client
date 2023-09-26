import Embed from '../embed';
import { EmbedMessageReceived } from '../types';

/**
 * Send a message to the embed via postMessage
 *
 * @param embed The instance of the embed where to send the message
 * @param method The name of the method to call
 * @param parameters The parameters to pass to the method
 */
export function postMessage(embed: Embed, method: string, parameters?: unknown): void {
  if (!embed.element.contentWindow || !embed.element.contentWindow.postMessage) {
    throw new Error('No `contentWindow` or `contentWindow.postMessage` available on the element');
  }

  const message = {
    method,
    parameters,
  };

  embed.element.contentWindow.postMessage(message, embed.origin);
}

/**
 * Parse a message received from postMessage
 *
 * @param data The data received from postMessage
 * @return Received message from the embed
 */
export function parseMessage(data: string | Record<string, unknown>): EmbedMessageReceived {
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  return data as unknown as EmbedMessageReceived;
}
