import type { z, ZodType } from 'zod';

export default async function parseRes<ZT extends ZodType>(
  schema: ZT,
  res: Response,
): Promise<z.infer<ZT>> {
  if (!res.ok) {
    return Promise.reject(new Error(`Request failed with status ${res.status}: ${res.statusText}`));
  }

  return schema.parse(await res.json());
}
