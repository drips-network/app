import network from '$lib/stores/wallet/network';
import { redirect } from '@sveltejs/kit';
import { fetchBlogPosts } from '$lib/utils/blog-posts';
import { paginatePosts } from '$lib/utils/paginate-posts';

export const load = async () => {
  if (network.alternativeChainMode) {
    // Serve from the `mainnet` instance
    return redirect(308, 'https://drips.network/blog');
  }

  const allPosts = await fetchBlogPosts();
  const sortedPosts = allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const { posts, totalPages } = paginatePosts(sortedPosts, 1);

  return {
    posts,
    totalPages,
    currentPage: 1,
  };
};

export const prerender = true;
