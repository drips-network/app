import network from '$lib/stores/wallet/network';
import { error, redirect } from '@sveltejs/kit';
import assert from '$lib/utils/assert';
import { authorSchema, metadataSchema } from '../../../../api/blog/posts/schema';
import type { z } from 'zod';

export const load = async ({ url, params }) => {
  if (network.alternativeChainMode) {
    // Serve from the `mainnet` instance
    return redirect(308, `https://drips.network${url.pathname}`);
  }

  try {
    const post = await import(`../../../../../blog-posts/${params.slug}.md`);
    const metadata = metadataSchema.parse(post.metadata);

    let author: z.infer<typeof authorSchema> | undefined;
    if (post.metadata.author) {
      const authorDesc = await import(`../../../../../blog-posts/authors/${metadata.author}.json`);
      assert(
        authorDesc,
        `Unable to locate blog author with ID ${metadata.author}. Make sure the ID is present in /src/blog-posts/authors/`,
      );

      author = authorSchema.parse(authorDesc);
    }

    return {
      PostContent: post.default,
      meta: { ...metadata, author, slug: params.slug },
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return error(404, 'Post not found');
  }
};

export const prerender = !network.alternativeChainMode;
