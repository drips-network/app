import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

interface ScrollStore {
  initialized: boolean;
  pos: number;
  scrolling: boolean;
  direction: 'up' | 'down' | undefined;
}

const INITIAL_STATE = {
  initialized: false,
  pos: 0,
  direction: undefined,
  scrolling: false,
};

const store = writable<ScrollStore>({
  ...INITIAL_STATE,
  pos: browser ? Math.max(window.scrollY, 0) : 0,
});

const html = browser && document.querySelector('html');

/**
 * Initializes the store by attaching required listeners to `window`.
 */
function attach(): void {
  if (!get(store).initialized) {
    window.addEventListener('scroll', () => _update());
    store.update((s) => ({
      ...s,
      initialized: true,
    }));
  }
}

/**
 * Resets the store and detaches global event listeners.
 */
function detach() {
  window.removeEventListener('scroll', () => _update());
  store.set(INITIAL_STATE);
}

/**
 * Locks scroll on the root element of the document.
 */
function lock() {
  if (!html) throw new Error('Unable to select `html` element');
  html.style.overflow = 'hidden';
}

/**
 * Unlocks scroll on the root element of the document.
 */
function unlock() {
  if (!html) throw new Error('Unable to select `html` element');
  html.style.overflow = 'scroll';
}

function _update() {
  let newValues = {};

  const pos = Math.max(window.scrollY, 0);
  const scrolling = pos !== get(store).pos;
  newValues = {
    scrolling,
    pos,
  };

  if (scrolling) {
    const direction = pos > get(store).pos ? 'down' : 'up';

    newValues = {
      ...newValues,
      direction,
    };
  }

  store.update((s) => ({
    ...s,
    ...newValues,
  }));
}

export default {
  subscribe: store.subscribe,
  attach,
  detach,
  lock,
  unlock,
};
