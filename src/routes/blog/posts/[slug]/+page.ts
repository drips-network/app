import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  try {
    const post = await import(`../../../../blog-posts/${params.slug}.md`);

    return {
      PostContent: post.default,
      meta: { ...post.metadata, slug: params.slug },
    };
  } catch {
    error(404);
  }
};

export const prerender = true;
