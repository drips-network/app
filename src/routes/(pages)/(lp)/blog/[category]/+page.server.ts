import network from '$lib/stores/wallet/network';
import { error, redirect } from '@sveltejs/kit';
import { fetchBlogPosts } from '$lib/utils/blog-posts';
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

  const posts = await fetchBlogPosts();

  const filteredPosts = posts
    .filter((p) => p.categories.includes(validCategory))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    posts: filteredPosts,
    category: validCategory,
  };
};

export const prerender = true;
