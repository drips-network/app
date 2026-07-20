import { error } from '@sveltejs/kit';
import { z } from 'zod';
import type { EntryGenerator } from './$types.js';
import Jimp from 'jimp';
import { getSlug } from '$lib/utils/blog-posts.js';
import { BLOG_COVER_IMAGE_VARIANTS } from '$lib/utils/blog-cover-images';

export const GET = async ({ params }) => {
  const { slug, variant } = params;

  const dimensions =
    BLOG_COVER_IMAGE_VARIANTS[variant as keyof typeof BLOG_COVER_IMAGE_VARIANTS] ?? undefined;
  if (!dimensions) error(400, 'Unknown variant');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let post: any;
  try {
    post = await import(`../../../../../blog-posts/${slug}.md`);
  } catch {
    error(404, 'Post not found');
  }

  const { coverImage } = z.object({ coverImage: z.string() }).parse(post.metadata);

  const jimp = (await Jimp.read(`static${coverImage}`))
    .cover(dimensions.width, dimensions.height)
    .quality(80);

  return new Response((await jimp.getBufferAsync(Jimp.MIME_JPEG)) as BodyInit, {
    headers: {
      'content-type': 'image/jpeg',
    },
  });
};

export const prerender = true;

// Tell SvelteKit to prerender every variant of every post's cover image
export const entries: EntryGenerator = async () => {
  const allPosts = import.meta.glob('/src/blog-posts/*.md', { as: 'raw' });

  const slugs = Object.keys(allPosts).map(getSlug);

  return slugs.flatMap((slug) =>
    Object.keys(BLOG_COVER_IMAGE_VARIANTS).map((variant) => ({ slug, variant })),
  );
};
