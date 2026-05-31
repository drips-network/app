import z from 'zod';

export const paginationSchema = z.object({
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  // Opaque keyset cursor for the next page, or null when there is none. Only
  // present on endpoints that support cursor pagination (e.g. /api/issues for
  // createdAt/updatedAt sorts). Absent on offset-only responses.
  nextCursor: z.string().nullable().optional(),
});
export type Pagination = z.infer<typeof paginationSchema>;

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: paginationSchema,
  });
export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

export type PaginationInput =
  | {
      page?: number;
      limit?: number;
      /** Keyset cursor from a prior response's `pagination.nextCursor`. */
      cursor?: string;
    }
  | undefined;

export function toPaginationParams(pagination?: PaginationInput): string {
  const params = new URLSearchParams();

  if (pagination?.page !== undefined) {
    params.append('page', pagination.page.toString());
  }

  if (pagination?.limit !== undefined) {
    params.append('limit', pagination.limit.toString());
  }

  if (pagination?.cursor !== undefined) {
    params.append('cursor', pagination.cursor);
  }

  return params.toString();
}
