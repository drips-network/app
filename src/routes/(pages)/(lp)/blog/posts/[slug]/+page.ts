import network from '$lib/stores/wallet/network';
import { error, redirect } from '@sveltejs/kit';
import { metadataSchema } from '../../../../../api/blog/posts/schema';
import { resolveAuthors } from '$lib/utils/blog-authors';

export const load = async ({ url, params }) => {
  if (network.alternativeChainMode) {
    // Serve from the `mainnet` instance
    return redirect(308, `https://drips.network${url.pathname}`);
  }

  try {
    const post = await import(`../../../../../../blog-posts/${params.slug}.md`);
    const { author, ...metadata } = metadataSchema.parse(post.metadata);

    const authors = await resolveAuthors(
      author,
      (id) => import(`../../../../../../blog-posts/authors/${id}.json`),
    );

    return {
      PostContent: post.default,
      meta: { ...metadata, authors, slug: params.slug },
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return error(404, 'Post not found');
  }
};

export const prerender = !network.alternativeChainMode;
