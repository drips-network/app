import { compile } from 'mdsvex';
import assert from '$lib/utils/assert';
import { authorSchema, metadataSchema } from '../../routes/api/blog/posts/schema';
import type { z } from 'zod';

export const getSlug = (path: string): string => {
  const slug = path.split('/').pop()?.slice(0, -3);
  assert(slug);

  return slug;
};

export const fetchRawBlogPosts = async () => {
  return Promise.all(
    Object.entries(import.meta.glob('/src/blog-posts/*.md', { as: 'raw' })).map(
      async ([path, resolver]) => {
        const resolved = await resolver();
        const compiled = await compile(resolved);

        // Get and assert slug
        const slug = getSlug(path);

        // Get the frontmatter
        const fm = (compiled?.data && 'fm' in compiled.data && compiled.data.fm) ?? {};

        return { ...fm, slug };
      },
    ),
  );
};

export const fetchBlogPosts = async () => {
  return Promise.all(
    Object.entries(import.meta.glob('/src/blog-posts/*.md')).map(async ([path, resolver]) => {
      const resolved = await resolver();

      assert(typeof resolved === 'object' && resolved && 'metadata' in resolved);

      const metadata = metadataSchema.parse(resolved.metadata);

      let author: z.infer<typeof authorSchema> | undefined;
      if (metadata.author) {
        const authorDesc = await import(`../../blog-posts/authors/${metadata.author}.json`);
        assert(
          authorDesc,
          `Unable to locate blog author with ID ${metadata.author}. Make sure the ID is present in /src/blog-posts/authors/`,
        );

        author = authorSchema.parse(authorDesc);
      }

      // Get and assert slug
      const slug = getSlug(path);

      return { ...metadata, author, slug };
    }),
  );
};
