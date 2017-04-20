/**
 * Send a message to the embed via postMessage
 *
 * @param {Embed} embed
 * @param {string} method The name of the method to call
 * @param {string} parameters The parameters to pass to the method
 */
export function postMessage(embed, method, parameters) {
  if (!embed.element.contentWindow || !embed.element.contentWindow.postMessage) {
    throw new Error('No `contentWindow` or `contentWindow.postMessage` avaialble on the element');
  }

  let message = {
    method,
    parameters
  };

  embed.element.contentWindow.postMessage(message, embed.origin);
}

/**
 * Parse a message received from postMessage
 *
 * @param {string|object} data The data received from postMessage
 * @return {object}
 */
export function parseMessage(data) {
  if (typeof data === 'string') {
    data = JSON.parse(data);
  }
  return data;
}
