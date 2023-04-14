// Not intended as an exhaustive list, just for our needs
const TABBABLE_ELEMS = ['INPUT', 'BUTTON', 'A'];

/**
 * Sets elements that are "tabbable" by default and nested within the provided element to be either tabbable or not.
 * @param elem The parent element to start traversing the child tree of.
 * @param value The value to set the tabindex attribute to.
 */
export default function setTabIndexRecursively(elem: Element, value: '-1' | '0') {
  for (const child of elem.children ?? []) {
    if (TABBABLE_ELEMS.includes(child.tagName)) child.setAttribute('tabindex', value);
    setTabIndexRecursively(child, value);
  }
}
