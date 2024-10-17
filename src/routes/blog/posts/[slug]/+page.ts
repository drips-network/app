import network from '$lib/stores/wallet/network';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ url, params }) => {
  if (network.alternativeChainMode) {
    // Serve from the `mainnet` instance
    return redirect(308, `https://drips.network${url.pathname}`);
  }

  try {
    const post = await import(`../../../../blog-posts/${params.slug}.md`);

    return {
      PostContent: post.default,
      meta: { ...post.metadata, slug: params.slug },
    };
  } catch {
    error(404);
  }
};

export const prerender = !network.alternativeChainMode;
