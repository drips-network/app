import { json } from '@sveltejs/kit';
import { compile } from 'mdsvex';
import assert from '$lib/utils/assert';

export const GET = async () => {
  const posts = await Promise.all(
    Object.entries(import.meta.glob('/src/blog-posts/*.md', { as: 'raw' })).map(
      async ([path, resolver]) => {
        const resolved = await resolver();
        const compiled = await compile(resolved);

        const slug = path.split('/').pop()?.slice(0, -3);
        assert(slug);

        // Get the frontmatter
        const fm = (compiled?.data && 'fm' in compiled.data && compiled.data.fm) ?? {};

        return { ...fm, slug };
      },
    ),
  );

  return json(posts);
};

export const prerender = true;
