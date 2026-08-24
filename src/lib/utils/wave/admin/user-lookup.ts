import z from 'zod';
import { authenticatedCall } from '../call';
import parseRes from '../utils/parse-res';

export const adminUserLookupResultSchema = z.object({
  gitHubUserId: z.number().int(),
  gitHubUsername: z.string(),
  gitHubName: z.string().nullable(),
  gitHubAvatarUrl: z.string().nullable(),
  /** Null when the GitHub account has never signed up to Wave. */
  waveUserId: z.uuid().nullable(),
  /** Where the record came from — our own records, or the GitHub API. */
  source: z.enum(['wave', 'github']),
});
export type AdminUserLookupResult = z.infer<typeof adminUserLookupResultSchema>;

/**
 * Resolves a GitHub username, a numeric GitHub user ID, or a Wave user ID
 * (UUID) to a single user. Returns null when nothing matches.
 *
 * Wave's own records are the primary source, so this resolves accounts the
 * public GitHub API won't return. Requires the `manageBans` permission.
 */
export async function lookUpUser(f = fetch, query: string): Promise<AdminUserLookupResult | null> {
  const res = await authenticatedCall(
    f,
    `/api/admin/users/lookup?query=${encodeURIComponent(query)}`,
  );

  if (res.status === 503) {
    throw new Error('Could not reach GitHub to resolve this user. Please try again.');
  }

  return parseRes(adminUserLookupResultSchema, res, { expect404: true });
}
