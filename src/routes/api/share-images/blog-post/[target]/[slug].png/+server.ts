import assert from '$lib/utils/assert';
import { error } from '@sveltejs/kit';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { html as toReactElement } from 'satori-html';
import { z } from 'zod';
import type { EntryGenerator } from './$types.js';

export const GET = async ({ url, params }) => {
  const { slug, target } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let post: any;
  try {
    post = await import(`../../../../../../blog-posts/${slug}.md`);
  } catch {
    throw error(404, 'Post not found');
  }

  const metadataSchema = z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    coverImage: z.string(),
    coverImageAlt: z.string(),
  });

  const metadata = metadataSchema.parse(post.metadata);

  try {
    assert(target === 'twitter' || target === 'og');
  } catch (e) {
    throw error(400, 'Invalid or missing target param');
  }

  const height = target === 'twitter' ? 600 : 675;

  const svg = await satori(
    toReactElement(
      `<img src="${url.protocol}//${url.host}/${metadata.coverImage}" width="1200px" height="${height}px" style="object-fit: cover" />`,
    ),
    {
      width: 1200,
      height: height,
      fonts: [],
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  const image = resvg.render();

  return new Response(image.asPng(), {
    headers: {
      'content-type': 'image/png',
    },
  });
};

export const prerender = true;

// Tell SvelteKit to prerender all blog post share images
export const entries: EntryGenerator = async () => {
  const allPosts = import.meta.glob('/src/blog-posts/*.md', { as: 'raw' });

  const slugs = await Promise.all(
    Object.entries(allPosts).map(async ([path]) => {
      const slug = path.split('/').pop()?.slice(0, -3);
      assert(slug);

      return slug;
    }),
  );

  return slugs.reduce<{ slug: string; target: string }[]>((acc, slug) => {
    return [...acc, { slug, target: 'twitter' }, { slug, target: 'og' }];
  }, []);
};
