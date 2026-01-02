import { fetchBlogPosts } from '$lib/utils/blog-posts';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
  const posts = await fetchBlogPosts();

  const staticPages = [
    '',
    '/solutions/dependency-funding',
    '/solutions/ecosystem-funding',
    '/solutions/hackathons',
    '/solutions/pro-pgf',
    '/solutions/programmable-cashflow',
    '/solutions/retro-pgf',
    '/solutions/wave',
    '/legal/access',
    '/legal/disclaimer',
    '/legal/privacy',
    '/blog',
  ];

  const site = url.origin;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${site}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? 1.0 : 0.8}</priority>
  </url>`,
    )
    .join('')}
  ${posts
    .map(
      (post) => `
  <url>
    <loc>${site}/blog/posts/${post.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`,
    )
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600',
    },
  });
};
