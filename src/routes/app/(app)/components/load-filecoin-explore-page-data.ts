import { postsListingSchema } from '../../../api/blog/posts/schema';

export default async function loadFilecoinExporePageData(f: typeof fetch) {
  const fetchBlogPosts = async () => {
    return postsListingSchema.parse(await (await f('/api/blog/posts')).json());
  };

  const [blogPosts] = await Promise.all([fetchBlogPosts()]);

  return {
    blogPosts,
  };
}
