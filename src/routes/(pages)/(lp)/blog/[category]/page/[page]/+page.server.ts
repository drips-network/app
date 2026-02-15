import network from '$lib/stores/wallet/network';
import { error, redirect } from '@sveltejs/kit';
import { fetchBlogPosts, fetchRawBlogPosts } from '$lib/utils/blog-posts';
import { paginatePosts, getTotalPages } from '$lib/utils/paginate-posts';
import { BLOG_CATEGORIES } from '../../../../../../api/blog/posts/schema';

export const entries = async () => {
  const posts = await fetchRawBlogPosts();
  const result: { category: string; page: string }[] = [];

  for (const category of BLOG_CATEGORIES) {
    const filtered = posts.filter((p) => p.categories.includes(category));
    const totalPages = getTotalPages(filtered.length);

    for (let page = 2; page <= totalPages; page++) {
      result.push({ category, page: String(page) });
    }
  }

  return result;
};

export const load = async ({ params }) => {
  if (network.alternativeChainMode) {
    return redirect(308, `https://drips.network/blog/${params.category}/page/${params.page}`);
  }

  const category = params.category;

  if (!BLOG_CATEGORIES.includes(category as (typeof BLOG_CATEGORIES)[number])) {
    error(404, 'Unknown blog category');
  }

  const validCategory = category as (typeof BLOG_CATEGORIES)[number];
  const page = parseInt(params.page, 10);

  if (isNaN(page) || page < 2) {
    error(404, 'Invalid page number');
  }

  const allPosts = await fetchBlogPosts();

  const filteredPosts = allPosts
    .filter((p) => p.categories.includes(validCategory))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const { posts, totalPages } = paginatePosts(filteredPosts, page);

  if (page > totalPages) {
    error(404, 'Page not found');
  }

  return {
    posts,
    category: validCategory,
    totalPages,
    currentPage: page,
  };
};

export const prerender = true;
