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

  // Multiple layouts attach the store. Ref-count so that one layout's teardown
  // during a client-side navigation doesn't detach it from the layout that's mounting.
  let attachCount = 0;

  /**
   * Attach the store to the window resize event and populate state.
   */
  function attach() {
    if (!browser) return;

    attachCount++;
    if (attachCount === 1) window.addEventListener('resize', _update);

    _update();
  }

  /**
   * Detach the store from the window resize event and clear state once
   * no consumers remain attached.
   */
  function detach() {
    if (!browser || attachCount === 0) return;

    attachCount--;
    if (attachCount > 0) return;

    window.removeEventListener('resize', _update);

    state.set(undefined);
  }

  function _update() {
    if (attachCount === 0) return;

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
