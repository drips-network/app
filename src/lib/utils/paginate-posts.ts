export const FIRST_PAGE_COUNT = 9;
export const POSTS_PER_PAGE = 10;

export function getTotalPages(postCount: number) {
  if (postCount <= FIRST_PAGE_COUNT) return 1;
  return 1 + Math.ceil((postCount - FIRST_PAGE_COUNT) / POSTS_PER_PAGE);
}

export function paginatePosts<T>(posts: T[], page: number) {
  const totalPages = getTotalPages(posts.length);

  if (page === 1) {
    return { posts: posts.slice(0, FIRST_PAGE_COUNT), totalPages };
  }

  const start = FIRST_PAGE_COUNT + (page - 2) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(start, start + POSTS_PER_PAGE);

  return { posts: paginatedPosts, totalPages };
}
