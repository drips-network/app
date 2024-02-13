import assert from '$lib/utils/assert';
import { metadataSchema } from '../api/blog/posts/schema';

export const load = async () => {
  const posts = await Promise.all(
    Object.entries(import.meta.glob('/src/blog-posts/*.md')).map(async ([path, resolver]) => {
      const resolved = await resolver();

      assert(typeof resolved === 'object' && resolved && 'metadata' in resolved);

      const metadata = metadataSchema.parse(resolved.metadata);

      const slug = path.split('/').pop()?.slice(0, -3);

      assert(slug);

      return { ...metadata, slug };
    }),
  );

  const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    posts: sortedPosts,
  };
};

export const prerender = true;
