import type { PaginatedResponse } from './types/pagination';

/**
 * Fetches all pages of a paginated API endpoint and returns the combined data.
 * @param fetchPage - A function that fetches a single page given a page number
 * @param limit - The number of items per page (default: 100)
 * @returns All items from all pages combined
 */
export async function getAllPaginated<T>(
  fetchPage: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
  limit = 100,
): Promise<T[]> {
  const allItems: T[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await fetchPage(page, limit);
    allItems.push(...response.data);
    hasNextPage = response.pagination.hasNextPage;
    page++;
  }

  return allItems;
}
