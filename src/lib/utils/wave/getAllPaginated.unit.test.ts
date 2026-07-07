import { describe, expect, it, vi } from 'vitest';
import { getAllPaginated } from './getAllPaginated';
import type { PaginatedResponse } from './types/pagination';

function response<T>(
  data: T[],
  pagination: { hasNextPage: boolean; page?: number; nextCursor?: string | null },
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      total: 0,
      page: pagination.page ?? 1,
      limit: 100,
      totalPages: 0,
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: false,
      ...(pagination.nextCursor !== undefined ? { nextCursor: pagination.nextCursor } : {}),
    },
  };
}

describe('getAllPaginated', () => {
  it('returns the single page when there is no next page', async () => {
    const fetchPage = vi.fn(async () => response([1, 2], { hasNextPage: false }));

    const all = await getAllPaginated(fetchPage);

    expect(all).toEqual([1, 2]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith(1, 100, undefined);
  });

  it('falls back to page-number pagination when no nextCursor is returned', async () => {
    const fetchPage = vi
      .fn<
        (
          page: number | undefined,
          limit: number,
          cursor?: string,
        ) => Promise<PaginatedResponse<number>>
      >()
      .mockResolvedValueOnce(response([1, 2], { hasNextPage: true, page: 1 }))
      .mockResolvedValueOnce(response([3, 4], { hasNextPage: true, page: 2 }))
      .mockResolvedValueOnce(response([5], { hasNextPage: false, page: 3 }));

    const all = await getAllPaginated(fetchPage);

    expect(all).toEqual([1, 2, 3, 4, 5]);
    expect(fetchPage.mock.calls).toEqual([
      [1, 100, undefined],
      [2, 100, undefined],
      [3, 100, undefined],
    ]);
  });

  it('prefers the keyset cursor once the endpoint mints one', async () => {
    const fetchPage = vi
      .fn<
        (
          page: number | undefined,
          limit: number,
          cursor?: string,
        ) => Promise<PaginatedResponse<number>>
      >()
      // First request has no cursor (offset mode) but mints one.
      .mockResolvedValueOnce(response([1, 2], { hasNextPage: true, nextCursor: 'cursor-1' }))
      .mockResolvedValueOnce(response([3, 4], { hasNextPage: true, nextCursor: 'cursor-2' }))
      // Last page: nextCursor null → hasNextPage false.
      .mockResolvedValueOnce(response([5], { hasNextPage: false, nextCursor: null }));

    const all = await getAllPaginated(fetchPage);

    expect(all).toEqual([1, 2, 3, 4, 5]);
    // First request pages by number; once a cursor is minted it drives paging
    // and `page` is dropped (undefined), so only `{ cursor, limit }` is sent.
    expect(fetchPage.mock.calls).toEqual([
      [1, 100, undefined],
      [undefined, 100, 'cursor-1'],
      [undefined, 100, 'cursor-2'],
    ]);
  });

  it('honors a custom limit', async () => {
    const fetchPage = vi.fn(async () => response([1], { hasNextPage: false }));

    await getAllPaginated(fetchPage, 25);

    expect(fetchPage).toHaveBeenCalledWith(1, 25, undefined);
  });
});
