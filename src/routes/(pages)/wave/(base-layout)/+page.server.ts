import { fetchBlogPosts } from '$lib/utils/blog-posts';

export const load = async () => {
  const allPosts = await fetchBlogPosts();
  const blogPosts = allPosts.filter((p) => p.categories.includes('wave'));

  return { blogPosts };
};
