import { writable } from 'svelte/store';

export interface Highlight {
  title: string;
  description: string;
  element: Element;
  borderRadius: string;
  paddingPx: number;
}

const currentHighlight = writable<Highlight | null>(null);

/**
 * Display a highlight around `config.element`, with the provided text.
 * @param config Title, description and element for the highlight.
 */
function highlight(config: Highlight) {
  // Allow disabling highlights for testing purposes.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).disableHighlights === true) return;

  currentHighlight.set(config);
}

/**
 * Clear the current highlight, if any.
 */
function clearHighlight() {
  currentHighlight.set(null);
}

export default {
  subscribe: currentHighlight.subscribe,
  highlight,
  clearHighlight,
};
