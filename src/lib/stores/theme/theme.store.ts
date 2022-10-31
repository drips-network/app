import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import { z } from 'zod';

export type Theme = 'light' | 'dark' | 'h4x0r';

interface State {
  selectedTheme: 'auto' | Theme;
  currentTheme: Theme;
}

const storedThemeSchema = z.union([
  z.literal('auto'),
  z.literal('light'),
  z.literal('dark'),
  z.literal('h4x0r'),
  z.null(),
]);

export default (() => {
  const darkModeQuery = browser && window.matchMedia('(prefers-color-scheme: dark)');
  const prefersDarkMode = darkModeQuery ? darkModeQuery.matches : false;
  const preferredTheme = prefersDarkMode ? 'light' : 'dark';
  const storedTheme = browser
    ? storedThemeSchema.parse(localStorage.getItem('theme-preference'))
    : null;

  let initialSelectedTheme: 'auto' | Theme;
  switch (storedTheme) {
    case null: {
      initialSelectedTheme = 'auto';
      break;
    }
    default: {
      initialSelectedTheme = storedTheme;
    }
  }

  const state = writable<State>({
    selectedTheme: initialSelectedTheme,
    currentTheme: initialSelectedTheme === 'auto' ? preferredTheme : initialSelectedTheme,
  });

  if (browser) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      _updateTheme();
    });
    _updateTheme();
  }

  /**
   * Set a new selected theme, which can be either an explicit theme value or 'auto' to
   * follow the system value (dark or light) going forward.
   * @param option The theme to select, or 'auto' to use the system theme.
   */
  function selectTheme(option: 'auto' | Theme) {
    state.update((v) => ({
      ...v,
      selectedTheme: option,
    }));

    _updateTheme();

    localStorage.setItem('theme-preference', option);
  }

  /** @private */
  function _updateTheme() {
    const { selectedTheme } = get(state);

    if (selectedTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      state.update((v) => ({ ...v, currentTheme: prefersDark?.matches ? 'dark' : 'light' }));
    } else {
      state.update((v) => ({ ...v, currentTheme: selectedTheme }));
    }
  }

  return {
    subscribe: state.subscribe,
    selectTheme,
  };
})();
