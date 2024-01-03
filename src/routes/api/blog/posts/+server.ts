import { json } from '@sveltejs/kit';
import { compile } from 'mdsvex';

export const GET = async () => {
  const posts = await Promise.all(
    Object.entries(import.meta.glob('/src/blog-posts/*.md', { as: 'raw' })).map(
      async ([path, resolver]) => {
        const resolved = await resolver();
        const compiled = await compile(resolved);

        const slug = path.split('/').pop().slice(0, -3);

        // Get the frontmatter
        const fm = (compiled?.data && 'fm' in compiled.data && compiled.data.fm) ?? {};

        return { ...fm, slug };
      },
    ),
  );

  return json(posts);
};

export const prerender = true;
