/**
 * Select and normalize the DOM element input
 *
 * @param {(HTMLIFrameElement|HTMLElement|string|jQuery)} element
 * @return {(HTMLIFrameElement|HTMLElement)}
 */
export function normalizeElement(element) {
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
    const iframe = element.querySelector('iframe');
    if (iframe) {
      element = iframe;
    }
  }

  return element;
}
