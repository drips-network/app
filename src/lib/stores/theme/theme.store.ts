import { browser } from '$app/environment';
import storedWritable from '@efstajas/svelte-stored-writable';
import { derived, get, writable } from 'svelte/store';
import { z } from 'zod';

const META_THEME_COLOR = {
  blue: '#5555ff',
  pink: '#ff55ff',
  orange: '#ff7b00',
} as const;

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

  const storedPrimaryColor = storedWritable(
    'primary-color',
    storedPrimaryColorSchema,
    'default',
    !browser,
  );
  const storedThemePreference = storedWritable('theme', storedThemeSchema, 'auto', !browser);
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

  /** @private */
  function _updateMetaThemeColor() {
    if (!browser) return;

    const metaThemeColorElem = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColorElem) return;

    const primaryColor = get(storedPrimaryColor);

    let newMetaThemeColor: string;

    if (primaryColor === 'default') {
      const theme = get(currentThemeState).currentTheme;

      newMetaThemeColor = theme === 'h4x0r' ? META_THEME_COLOR.orange : META_THEME_COLOR.blue;
    } else {
      newMetaThemeColor = META_THEME_COLOR[primaryColor];
    }

    metaThemeColorElem.setAttribute('content', newMetaThemeColor);
  }

  currentThemeState.subscribe((state) => {
    if (browser) document.documentElement.setAttribute('data-theme', state.currentTheme);
    _updateMetaThemeColor();
  });

  storedPrimaryColor.subscribe((state) => {
    if (browser) document.documentElement.setAttribute('data-primary-color', state);
    _updateMetaThemeColor();
  });

  return {
    subscribe: currentThemeState.subscribe,
    primaryColor: {
      subscribe: storedPrimaryColor.subscribe,
    },
    selectTheme,
    selectPrimaryColor,
  };
})();
