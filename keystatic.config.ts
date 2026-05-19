import { collection, config, fields } from '@keystatic/core';

// Keep in sync with BLOG_CATEGORIES / BLOG_CATEGORY_LABELS in
// src/routes/api/blog/posts/schema.ts. (Inlined here because this file is
// loaded by Node directly at Vite-startup, before TS source resolution.)
const BLOG_CATEGORY_OPTIONS = [
  { value: 'wave', label: 'Wave' },
  { value: 'product', label: 'Product' },
  { value: 'roundup', label: 'Roundups' },
  { value: 'ecosystem', label: 'Ecosystem' },
  { value: 'guide', label: 'Guides' },
];

// Lowercase + replace anything that's not a-z, 0-9, dot, or hyphen with `-`,
// collapse runs of `-`, trim leading/trailing `-`. Preserves the extension.
// Without this, uploads like "Frame 3.png" end up URL-encoded in the markdown
// (`Frame%203.png`) and break filesystem-path-based tools like rehype-img-size.
const slugifyFilename = (name: string): string => {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  const slug =
    base
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'file';
  return slug + ext.toLowerCase();
};

// Picking dev vs prod storage is awkward because this file gets evaluated in
// THREE different contexts, none of which agree on a signal:
//   1. The keystatic-sveltekit plugin imports it raw via Node at Vite startup
//      → process.env.NODE_ENV reflects the parent vite process.
//   2. SvelteKit's server runtime imports it via Vite transform
//      → process.env.NODE_ENV is set correctly by Vite.
//   3. The CMS UI bundle is built by rolldown (NOT Vite) and shipped to the
//      browser. rolldown hardcodes `process.env.NODE_ENV` to "production" for
//      React, and does NOT inject `import.meta.env.DEV` — so in the browser
//      the only reliable signal is the page's actual hostname.
const isDev =
  typeof window !== 'undefined'
    ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    : process.env.NODE_ENV !== 'production';

export default config({
  storage: isDev
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: 'drips-network/app',
        branchPrefix: 'cms/',
      },

  ui: {
    brand: { name: 'Drips Blog' },
    navigation: ['posts', 'authors'],
  },

  collections: {
    posts: collection({
      label: 'Blog posts',
      slugField: 'title',
      path: 'src/blog-posts/*',
      format: { contentField: 'content', data: 'yaml' },
      entryLayout: 'content',
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            validation: { length: { min: 1 } },
          },
          slug: {
            label: 'URL slug',
            description:
              'Determines the post URL (drips.network/blog/posts/<slug>) and filename. Auto-generated from the title — only override if you need to.',
          },
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          description: 'Short summary shown in post cards and previews.',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        date: fields.date({
          label: 'Date',
          description: 'Publication date. Posts are sorted newest-first by this field.',
          validation: { isRequired: true },
        }),
        coverImage: fields.image({
          label: 'Cover image',
          directory: 'static/assets/blog-images',
          publicPath: '/assets/blog-images/',
          validation: { isRequired: true },
          transformFilename: slugifyFilename,
        }),
        coverImageAlt: fields.text({
          label: 'Cover image alt text',
          description: 'Accessibility description of the cover image.',
          validation: { length: { min: 1 } },
        }),
        author: fields.array(
          fields.relationship({
            label: 'Author',
            collection: 'authors',
          }),
          {
            label: 'Authors',
            itemLabel: (props) => props.value ?? 'Pick an author',
          },
        ),
        categories: fields.multiselect({
          label: 'Categories',
          description: 'Pick at least one. Drives which category page(s) the post appears on.',
          options: BLOG_CATEGORY_OPTIONS,
        }),
        announcementBannerCopy: fields.text({
          label: 'Announcement banner copy',
          description:
            'Optional. If set, the post is featured in the site-wide announcement banner with this text.',
        }),
        content: fields.markdoc({
          label: 'Body',
          extension: 'md',
          options: {
            image: {
              directory: 'static/assets/blog-images',
              publicPath: '/assets/blog-images/',
              transformFilename: slugifyFilename,
            },
          },
        }),
      },
    }),

    authors: collection({
      label: 'Authors',
      slugField: 'name',
      path: 'src/blog-posts/authors/*',
      format: { data: 'json' },
      columns: ['name'],
      schema: {
        name: fields.slug({
          name: {
            label: 'Display name',
            validation: { length: { min: 1 } },
          },
          slug: {
            label: 'ID',
            description:
              'How posts reference this author in their `author` field. Keep this short and stable — changing it will break references in existing posts.',
          },
        }),
        avatarUrl: fields.image({
          label: 'Avatar',
          directory: 'static/assets/blog-images/authors',
          publicPath: '/assets/blog-images/authors/',
          validation: { isRequired: true },
          transformFilename: slugifyFilename,
        }),
      },
    }),
  },
});
