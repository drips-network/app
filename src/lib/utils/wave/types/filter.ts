import type { z, ZodObject } from 'zod';

export const filterSchema = <FT extends ZodObject>(filterSchema: FT) => filterSchema;

export function toFilterParams<FT extends ZodObject>(
  filterSchema: FT,
  filter: Partial<z.infer<FT>> | undefined,
): string {
  const params = new URLSearchParams();

  if (!filter) {
    return params.toString();
  }

  const parsed = filterSchema.parse(filter);

  for (const [key, value] of Object.entries(parsed)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }

  return params.toString();
}
