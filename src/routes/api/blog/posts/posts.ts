import { compile } from 'mdsvex';
import assert from '$lib/utils/assert';

// TODO: rename/move this file
export const fetchBlogPosts = async () => {
  return Promise.all(
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
};
