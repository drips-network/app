/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      screens: {
        'mouse': { raw: '(hover:hover)' } // targets only browser with mouse hover
      },
      colors: {
        // radicle-design-system - colors.css
        'primary': 'var(--color-primary)',
        'primary-level-1': 'var(--color-primary-level-1)',
        'primary-level-2': 'var(--color-primary-level-2)',
        'primary-level-6': 'var(--color-primary-level-6)',
        'positive': 'var(--color-positive)',
        'positive-level-1': 'var(--color-positive-level-1)',
        'positive-level-2': 'var(--color-positive-level-2)',
        'positive-level-6': 'var(--color-positive-level-6)',
        'caution': 'var(--color-caution)',
        'caution-level-1': 'var(--color-caution-level-1)',
        'caution-level-2': 'var(--color-caution-level-2)',
        'caution-level-6': 'var(--color-caution-level-6)',
        'negative': 'var(--color-negative)',
        'negative-level-1': 'var(--color-negative-level-1)',
        'negative-level-2': 'var(--color-negative-level-2)',
        'negative-level-6': 'var(--color-negative-level-6)',
        'foreground': 'var(--color-foreground)',
        'foreground-level-1': 'var(--color-foreground-level-1)',
        'foreground-level-2': 'var(--color-foreground-level-2)',
        'foreground-level-3': 'var(--color-foreground-level-3)',
        'foreground-level-4': 'var(--color-foreground-level-4)',
        'foreground-level-5': 'var(--color-foreground-level-5)',
        'foreground-level-6': 'var(--color-foreground-level-6)',
        'background': 'var(--color-background)',
      }
    },
  },
  plugins: [],
};
