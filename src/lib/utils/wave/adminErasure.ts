import z from 'zod';
import { authenticatedCall } from './call';
import parseRes from './utils/parse-res';

const erasureStepSchema = z.object({
  key: z.string(),
  label: z.string(),
  outcome: z.enum(['done', 'skipped', 'failed']),
  detail: z.string(),
  count: z.number().optional(),
});
export type ErasureStep = z.infer<typeof erasureStepSchema>;

const erasureNoteSchema = z.object({
  label: z.string(),
  detail: z.string(),
});
export type ErasureNote = z.infer<typeof erasureNoteSchema>;

export const erasureReportSchema = z.object({
  userId: z.uuid(),
  erasedGitHubUsername: z.string(),
  erasedAt: z.string(),
  tombstoneReviewAfter: z.string(),
  steps: z.array(erasureStepSchema),
  retained: z.array(erasureNoteSchema),
  manualFollowUps: z.array(erasureNoteSchema),
});
export type ErasureReport = z.infer<typeof erasureReportSchema>;

/**
 * Erases a user's personal data in response to a deletion request.
 *
 * Irreversible. `confirmGitHubUsername` must match the account's current
 * username or the backend refuses — a mistyped user ID is not enough on its own
 * to erase somebody.
 */
export async function eraseUser(
  f = fetch,
  params: { userId: string; confirmGitHubUsername: string; requestReference?: string },
) {
  return parseRes(
    erasureReportSchema,
    await authenticatedCall(f, '/api/admin/erasures', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  );
}
