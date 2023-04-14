// Not intended as an exhaustive list, just for our needs
const TABBABLE_ELEMS = ['INPUT', 'BUTTON', 'A'];

export default function setTabIndexRecursively(elem: Element, value: '-1' | '0') {
  for (const child of elem.children ?? []) {
    if (TABBABLE_ELEMS.includes(child.tagName)) child.setAttribute('tabindex', value);
    setTabIndexRecursively(child, value);
  }
}
