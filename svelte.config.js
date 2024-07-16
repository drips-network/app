import 'dotenv/config';

import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeLinks from 'rehype-external-links';
import rehypeImageSize from 'rehype-img-size';

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
      rehypePlugins: [
        rehypeSlug,
        rehypeAutolinkHeadings,
        [rehypeLinks, { target: '_blank' }],
        [rehypeImageSize, { dir: 'static' }],
      ],
    }),
  ],

  kit: {
    adapter: adapter(),
    prerender: {
      origin: process.env.DEPLOY_URL,
    },
  },
};

export default config;
