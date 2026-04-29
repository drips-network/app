import assert from '$lib/utils/assert';
import { authorSchema } from '../../routes/api/blog/posts/schema';
import type { z } from 'zod';

const toAuthorIds = (author: string | string[] | undefined): string[] =>
  author === undefined ? [] : Array.isArray(author) ? author : [author];

export const resolveAuthors = async (
  author: string | string[] | undefined,
  load: (id: string) => Promise<unknown>,
): Promise<z.infer<typeof authorSchema>[]> => {
  const ids = toAuthorIds(author);
  return Promise.all(
    ids.map(async (id) => {
      const authorDesc = await load(id);
      assert(
        authorDesc,
        `Unable to locate blog author with ID ${id}. Make sure the ID is present in /src/blog-posts/authors/`,
      );
      return authorSchema.parse(authorDesc);
    }),
  );
};
