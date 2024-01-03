import { z } from 'zod';
import assert from '$lib/utils/assert';

export const load = async () => {
  const posts = await Promise.all(
    Object.entries(import.meta.glob('/src/blog-posts/*.md')).map(async ([path, resolver]) => {
      const resolved = await resolver();

      assert(typeof resolved === 'object' && resolved && 'metadata' in resolved);

      const metadataSchema = z.object({
        title: z.string(),
        excerpt: z.string(),
        date: z.string(),
        coverImage: z.string(),
        coverImageAlt: z.string(),
      });

      const metadata = metadataSchema.parse(resolved.metadata);

      const slug = path.split('/').pop()?.slice(0, -3);

      return { ...metadata, slug };
    }),
  );

  const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    posts: sortedPosts,
  };
};

export const prerender = true;
