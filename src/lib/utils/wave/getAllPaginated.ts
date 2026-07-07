import type { PaginatedResponse } from './types/pagination';

/**
 * Fetches all pages of a paginated API endpoint and returns the combined data.
 *
 * Prefers keyset/cursor pagination when the endpoint returns a `nextCursor`
 * (O(limit) and exempt from the deep-offset 400 clamp), falling back to
 * page-number pagination otherwise. The `cursor` arg is only populated once the
 * first response mints one, so cursor-aware callers should forward it.
 * @param fetchPage - A function that fetches a single page given a page number,
 *   limit, and (for cursor-aware endpoints) the previous page's `nextCursor`
 * @param limit - The number of items per page (default: 100)
 * @returns All items from all pages combined
 */
export async function getAllPaginated<T>(
  fetchPage: (page: number, limit: number, cursor?: string) => Promise<PaginatedResponse<T>>,
  limit = 100,
): Promise<T[]> {
  const allItems: T[] = [];
  let page = 1;
  let cursor: string | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await fetchPage(page, limit, cursor);
    allItems.push(...response.data);
    hasNextPage = response.pagination.hasNextPage;
    // Prefer the keyset cursor when the endpoint provides one; it's O(limit) and
    // exempt from the deep-offset 400 clamp. Falls back to page++ otherwise.
    cursor = response.pagination.nextCursor ?? undefined;
    page++;
  }

  return allItems;
}
