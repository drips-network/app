import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/', '**/__generated__/**', '.netlify/'],
  },
  {
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-expressions': 'off',
      'svelte/no-at-html-tags': 'off',
      // Temporary fix for missing support of `generics` attribute in svelte-eslint-parser
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'svelte/no-navigation-without-resolve': [
        'error',
        {
          ignoreGoto: true,
          ignoreLinks: true,
          ignorePushState: false,
          ignoreReplaceState: false,
        },
      ],
    },
  },
];
