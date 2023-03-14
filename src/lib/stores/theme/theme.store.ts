import { browser } from '$app/environment';
import storedWritable from '$lib/utils/stored-writable';
import { derived, writable } from 'svelte/store';
import { z } from 'zod';

interface State {
  selectedTheme: 'auto' | Theme;
  currentTheme: Theme;
}

const storedThemeSchema = z.union([
  z.literal('auto'),
  z.literal('light'),
  z.literal('dark'),
  z.literal('h4x0r'),
]);

const storedPrimaryColorSchema = z.union([
  z.literal('default'),
  z.literal('blue'),
  z.literal('pink'),
  z.literal('orange'),
]);

export type Theme = 'light' | 'dark' | 'h4x0r';
export type PrimaryColor = z.infer<typeof storedPrimaryColorSchema>;

export default (() => {
  const darkModeQuery = browser && window.matchMedia('(prefers-color-scheme: dark)');
  const prefersDarkMode = darkModeQuery ? darkModeQuery.matches : false;

  const storedPrimaryColor = storedWritable('primary-color', storedPrimaryColorSchema, 'blue');
  const storedThemePreference = storedWritable('theme', storedThemeSchema, 'auto');
  const systemTheme = writable<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');

  const currentThemeState = derived<[typeof storedThemePreference, typeof systemTheme], State>(
    [storedThemePreference, systemTheme],
    ([state, systemTheme]) => {
      return {
        selectedTheme: state,
        currentTheme: state === 'auto' ? systemTheme : state,
      };
    },
  );

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
    storedThemePreference.set(option);
  }

  /**
   * Set a new selected theme, which can be either an explicit theme value or 'auto' to
   * follow the system value (dark or light) going forward.
   * @param option The theme to select, or 'auto' to use the system theme.
   */
  function selectPrimaryColor(option: PrimaryColor) {
    storedPrimaryColor.set(option);
  }

  /** @private */
  function _updateTheme() {
    const darkModeQuery = browser && window.matchMedia('(prefers-color-scheme: dark)');
    const prefersDarkMode = darkModeQuery ? darkModeQuery.matches : false;

    systemTheme.set(prefersDarkMode ? 'dark' : 'light');
  }

  return {
    subscribe: currentThemeState.subscribe,
    primaryColor: {
      subscribe: storedPrimaryColor.subscribe,
    },
    selectTheme,
    selectPrimaryColor,
  };
})();
