import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const BREAKPOINTS = {
  mobile: 0,
  tablet: 577,
  desktop: 768,
  desktopWide: 1252,
};

interface State {
  dimensions: {
    width: number;
    height: number;
  };
  breakpoint: keyof typeof BREAKPOINTS;
}

/**
 * A store that tracks the current window dimensions and breakpoint.
 * Generally, we should use CSS media queries for hiding large parts of the UI
 * based on breakpoint instead of this, so that the server renders the markup for
 * all screen sizes. In some situations though, certain functionaility (like showing
 * a tooltip on the sidenav's collapsed state) requires knowledge on the current
 * breakpoint in JS. This is what this is for.
 */
export default (() => {
  const state = writable<State | undefined>(undefined);

  let attached = false;

  /**
   * Attach the store to the window resize event and populate state.
   */
  function attach() {
    if (!browser) return;

    window.addEventListener('resize', _update);
    attached = true;

    _update();
  }

  /**
   * Detach the store from the window resize event and clear state.
   */
  function detach() {
    if (!browser) return;

    window.removeEventListener('resize', _update);
    attached = false;

    state.set(undefined);
  }

  function _update() {
    if (!attached) return;

    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    state.set({
      dimensions: {
        width: currentWidth,
        height: currentHeight,
      },
      breakpoint: _getBreakpoint(currentWidth),
    });
  }

  function _getBreakpoint(width: number): keyof typeof BREAKPOINTS {
    if (width < BREAKPOINTS.tablet) {
      return 'mobile';
    } else if (width < BREAKPOINTS.desktop) {
      return 'tablet';
    } else if (width < BREAKPOINTS.desktopWide) {
      return 'desktop';
    } else {
      return 'desktopWide';
    }
  }

  return {
    subscribe: state.subscribe,
    attach,
    detach,
  };
})();
