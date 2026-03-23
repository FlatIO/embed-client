/**
 * Select and normalize the DOM element input
 */
export function normalizeElement(
  element: HTMLIFrameElement | HTMLElement | string,
): HTMLIFrameElement | HTMLElement {
  // Find an element by identifier
  if (typeof element === 'string') {
    const container = document.getElementById(element);
    if (!container) {
      throw new TypeError(`The DOM element with the identifier "${element}" was not found.`);
    }
    element = container;
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
