import network from '$lib/stores/wallet/network';
import { error, redirect } from '@sveltejs/kit';
import { fetchBlogPosts } from '$lib/utils/blog-posts';
import { paginatePosts } from '$lib/utils/paginate-posts';
import { BLOG_CATEGORIES } from '../../../../api/blog/posts/schema';

export const entries = () => BLOG_CATEGORIES.map((category) => ({ category }));

export const load = async ({ params }) => {
  if (network.alternativeChainMode) {
    return redirect(308, `https://drips.network/blog/${params.category}`);
  }

  const category = params.category;

  if (!BLOG_CATEGORIES.includes(category as (typeof BLOG_CATEGORIES)[number])) {
    error(404, 'Unknown blog category');
  }

  const validCategory = category as (typeof BLOG_CATEGORIES)[number];

  const allPosts = await fetchBlogPosts();

  const filteredPosts = allPosts
    .filter((p) => p.categories.includes(validCategory))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const { posts, totalPages } = paginatePosts(filteredPosts, 1);

  return {
    posts,
    category: validCategory,
    totalPages,
    currentPage: 1,
  };
};

export const prerender = true;
