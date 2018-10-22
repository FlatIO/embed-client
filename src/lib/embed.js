/**
 * Build url for the new iframe
 *
 * @param {object} parameters
 */
export function buildIframeUrl(parameters) {
  let url = (parameters.baseUrl || 'https://flat-embed.com');

  // Score id or blank embed
  url += '/' + (parameters.score || 'blank');

  // Build qs parameters
  let urlParameters = Object.assign({
    jsapi: true
  }, parameters.embedParams);

  let qs = Object.keys(urlParameters)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(urlParameters[k])}`)
    .join('&');

  return url + '?' + qs;
}

/**
 * Create an iframe inside a specified element
 *
 * @param {HTMLElement} element
 * @param {object} parameters
 */
export function createEmbedIframe(element, parameters) {
  let url = buildIframeUrl(parameters);

  var iframe = document.createElement('iframe');
  iframe.setAttribute('src', url);
  iframe.setAttribute('width', parameters.width || '100%');
  iframe.setAttribute('height', parameters.height || '100%');
  iframe.setAttribute('allowfullscreen', true);
  iframe.setAttribute('frameborder', '0');

  element.appendChild(iframe);

  return iframe;
}
