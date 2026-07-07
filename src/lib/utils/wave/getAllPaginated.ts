import type { PaginatedResponse } from './types/pagination';

/**
 * Fetches all pages of a paginated API endpoint and returns the combined data.
 *
 * Prefers keyset/cursor pagination when the endpoint returns a `nextCursor`
 * (O(limit) and exempt from the deep-offset 400 clamp), falling back to
 * page-number pagination otherwise. Once a cursor is in play `page` is passed as
 * `undefined` so callers send only `{ cursor, limit }`, mirroring the issues
 * page; endpoints that never return a cursor keep paging by number.
 * @param fetchPage - A function that fetches a single page given the page number
 *   (undefined once a cursor drives paging), limit, and the previous page's
 *   `nextCursor` (for cursor-aware endpoints)
 * @param limit - The number of items per page (default: 100)
 * @returns All items from all pages combined
 */
export async function getAllPaginated<T>(
  fetchPage: (
    page: number | undefined,
    limit: number,
    cursor?: string,
  ) => Promise<PaginatedResponse<T>>,
  limit = 100,
): Promise<T[]> {
  const allItems: T[] = [];
  let page = 1;
  let cursor: string | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    // Once the endpoint mints a cursor, drop `page` and page by cursor only.
    const response = await fetchPage(cursor ? undefined : page, limit, cursor);
    allItems.push(...response.data);
    hasNextPage = response.pagination.hasNextPage;
    cursor = response.pagination.nextCursor ?? undefined;
    if (!cursor) page++;
  }

  return allItems;
}
