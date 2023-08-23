// Not intended as an exhaustive list, just for our needs
const TABBABLE_ELEMS = ['INPUT', 'BUTTON', 'A'];

/**
 * Sets elements that are "tabbable" by default and nested within the provided element to be either tabbable or not.
 * @param elem The parent element to start traversing the child tree of.
 * @param value The value to set the tabindex attribute to.
 */
export default function setTabIndexRecursively(elem: Element, value: '-1' | '0') {
  for (const child of elem.children ?? []) {
    const currentTabIndex = child.getAttribute('tabindex');

    // If the element currently has an explicit tabindex -1, doesn't have a data-previous-tabindex attribute, and we're
    // setting to 0, skip it so that we don't override the explicit tabindex.
    if (
      currentTabIndex === '-1' &&
      value === '0' &&
      !child.hasAttribute('data-previous-tabindex')
    ) {
      continue;
    }

    if (TABBABLE_ELEMS.includes(child.tagName) || child.hasAttribute('tabindex')) {
      child.setAttribute('tabindex', value);
    }

    if (currentTabIndex) child.setAttribute('data-previous-tabindex', currentTabIndex);

    setTabIndexRecursively(child, value);
  }
}
