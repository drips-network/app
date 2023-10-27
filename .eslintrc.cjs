module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier', 'plugin:svelte/prettier'],
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['*.cjs', '**/*.css'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // sourceType: 'module',
    // ecmaVersion: 2020,
    extraFileExtensions: ['.svelte'],
  },
  ignorePatterns: ['./svelte.config.js'],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
  ],
  rules: {
    'no-console': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    curly: ['error', 'multi-line', 'consistent'],
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
};
