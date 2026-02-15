import network from '$lib/stores/wallet/network';
import { error, redirect } from '@sveltejs/kit';
import { fetchBlogPosts, fetchRawBlogPosts } from '$lib/utils/blog-posts';
import { paginatePosts, getTotalPages } from '$lib/utils/paginate-posts';

export const entries = async () => {
  const posts = await fetchRawBlogPosts();
  const totalPages = getTotalPages(posts.length);

  return Array.from({ length: totalPages - 1 }, (_, i) => ({ page: String(i + 2) }));
};

export const load = async ({ params }) => {
  if (network.alternativeChainMode) {
    return redirect(308, `https://drips.network/blog/page/${params.page}`);
  }

  const page = parseInt(params.page, 10);

  if (isNaN(page) || page < 2) {
    error(404, 'Invalid page number');
  }

  const allPosts = await fetchBlogPosts();
  const sortedPosts = allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const { posts, totalPages } = paginatePosts(sortedPosts, page);

  if (page > totalPages) {
    error(404, 'Page not found');
  }

  return {
    posts,
    totalPages,
    currentPage: page,
  };
};

export const prerender = true;
