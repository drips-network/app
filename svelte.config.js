import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Ensures both .svelte and .md files are treated as components (can be imported and used anywhere, or used as pages)
  extensions: ['.svelte', '.md'],

  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    vitePreprocess({
      postcss: true,
    }),
    mdsvex({
      // The default mdsvex extension is .svx; this overrides that.
      extensions: ['.md'],
      layout: '/src/lib/components/blog/article-layout/article-layout.svelte',
    }),
  ],

  kit: {
    adapter: adapter(),
  },
};

export default config;
