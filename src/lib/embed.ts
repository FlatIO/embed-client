import type { EmbedParameters } from '../types';

/**
 * Build url for the new iframe
 *
 * @param {object} parameters
 */
export function buildIframeUrl(parameters: EmbedParameters) {
  let url = parameters.baseUrl || 'https://flat-embed.com';

  // Score id or blank embed
  if (!parameters.isCustomUrl) {
    url += `/${parameters.score || 'blank'}`;
  }

  // Build qs parameters
  const urlParameters: Record<string, string | number | boolean> = Object.assign(
    {
      jsapi: true,
    },
    parameters.embedParams as Record<string, string | number | boolean>,
  );

  const qs = Object.keys(urlParameters)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(urlParameters[k])}`)
    .join('&');

  return `${url}?${qs}`;
}

/**
 * Create an iframe inside a specified element
 *
 * @param {HTMLElement} element
 * @param {object} parameters
 */
export function createEmbedIframe(
  element: HTMLElement,
  parameters: EmbedParameters,
): HTMLIFrameElement {
  const url = buildIframeUrl(parameters);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', url);
  iframe.setAttribute('width', parameters.width || '100%');
  iframe.setAttribute('height', parameters.height || '100%');
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('allow', 'autoplay; midi');
  iframe.setAttribute('frameborder', '0');

  if (parameters.lazy) {
    iframe.setAttribute('loading', 'lazy');
  }

  element.appendChild(iframe);

  return iframe;
}
