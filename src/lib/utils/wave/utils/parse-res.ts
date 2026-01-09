import type { z, ZodType } from 'zod';

// Overload 1: When expect404 is explicitly true -> Returns Data | null
export default async function parseRes<ZT extends ZodType>(
  schema: ZT,
  res: Response,
  options: { expect404: true },
): Promise<z.infer<ZT> | null>;

// Overload 2: When expect404 is false or missing -> Returns Data (strict)
export default async function parseRes<ZT extends ZodType>(
  schema: ZT,
  res: Response,
  options?: { expect404?: false },
): Promise<z.infer<ZT>>;

// Implementation Signature (Handles both cases internally)
export default async function parseRes<ZT extends ZodType>(
  schema: ZT,
  res: Response,
  { expect404 = false }: { expect404?: boolean } = {},
): Promise<z.infer<ZT> | null> {
  if (!res.ok) {
    if (res.status === 404 && expect404) {
      // We can just return null here; the return type allows it.
      return null;
    }

    return Promise.reject(
      new Error(
        `Request failed with status ${res.status}: ${res.statusText} : ${await res.text()}`,
      ),
    );
  }

  const json = await res.json();
  return schema.parse(json);
}
