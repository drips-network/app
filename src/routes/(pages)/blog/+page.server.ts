import network from '$lib/stores/wallet/network';
import { redirect } from '@sveltejs/kit';
import { fetchBlogPosts } from '$lib/utils/blog-posts';

export const load = async () => {
  if (network.alternativeChainMode) {
    // Serve from the `mainnet` instance
    return redirect(308, 'https://drips.network/blog');
  }

  const posts = await fetchBlogPosts();
  const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    posts: sortedPosts,
  };
};

export const prerender = true;
