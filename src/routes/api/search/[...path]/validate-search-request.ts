import { z } from 'zod';

/**
 * The only Meilisearch endpoint the frontend uses (via `client.multiSearch` in
 * `$lib/components/search-bar/search.ts`). Everything else, like `keys`, `indexes/*`, `dumps` etc.,
 * must never be reachable through the proxy.
 */
export const ALLOWED_PATHS = ['/api/search/multi-search'];

/** Indexes the frontend searches. Queries against any other index are rejected. */
export const ALLOWED_INDEX_UIDS = ['projects', 'drip_lists'];

const indexUidSchema = z.enum(ALLOWED_INDEX_UIDS);

const multiSearchBodySchema = z.strictObject({
  federation: z
    .looseObject({
      facetsByIndex: z.partialRecord(indexUidSchema, z.unknown()).optional(),
    })
    .optional(),
  queries: z
    .array(
      z.looseObject({
        indexUid: indexUidSchema,
        // Remote federation would make Meilisearch query other instances on our behalf.
        federationOptions: z.looseObject({ remote: z.undefined() }).optional(),
      }),
    )
    .min(1),
});

export function isAllowedPath(pathname: string): boolean {
  // Exact match on the raw pathname, so percent-encoded or dot-segment variants never match.
  return ALLOWED_PATHS.includes(pathname);
}

export function isAllowedMultiSearchBody(body: unknown): boolean {
  return multiSearchBodySchema.safeParse(body).success;
}
