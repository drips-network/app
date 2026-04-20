import { compile } from 'mdsvex';
import assert from '$lib/utils/assert';
import { metadataSchema } from '../../routes/api/blog/posts/schema';
import { resolveAuthors } from '$lib/utils/blog-authors';

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
        const { author, ...fm } = metadataSchema.parse(
          compiled?.data && 'fm' in compiled.data && compiled.data.fm,
        );

        const authors = await resolveAuthors(
          author,
          (id) => import(`../../blog-posts/authors/${id}.json`),
        );

        return { ...fm, authors, slug };
      },
    ),
  );
};

export const fetchBlogPosts = async () => {
  return Promise.all(
    Object.entries(import.meta.glob('/src/blog-posts/*.md')).map(async ([path, resolver]) => {
      const resolved = await resolver();

      assert(typeof resolved === 'object' && resolved && 'metadata' in resolved);

      const { author, ...metadata } = metadataSchema.parse(resolved.metadata);

      const authors = await resolveAuthors(
        author,
        (id) => import(`../../blog-posts/authors/${id}.json`),
      );

      // Get and assert slug
      const slug = getSlug(path);

      return { ...metadata, authors, slug };
    }),
  );
};
