import { json } from '@sveltejs/kit';
import { fetchRawBlogPosts } from '../../../../lib/utils/blog-posts';

export const GET = async () => {
  const posts = await fetchRawBlogPosts();
  return json(posts);
};

export const prerender = true;
