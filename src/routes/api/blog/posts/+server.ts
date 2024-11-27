import { json } from '@sveltejs/kit';
import { fetchBlogPosts } from './posts';

export const GET = async () => {
  const posts = await fetchBlogPosts();
  return json(posts);
};

export const prerender = true;
