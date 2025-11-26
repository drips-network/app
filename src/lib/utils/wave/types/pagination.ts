import z from 'zod';

export const paginationSchema = z.object({
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});
export type Pagination = z.infer<typeof paginationSchema>;

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: paginationSchema,
  });

export type PaginationInput =
  | {
      page?: number;
      limit?: number;
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

  return params.toString();
}
