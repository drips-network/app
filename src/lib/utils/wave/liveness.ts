import z from 'zod';
import { redirect } from '@sveltejs/kit';
import { authenticatedCall, LivenessCheckpointRequiredError } from './call';
import parseRes from './utils/parse-res';

/** Areas that a checkpoint can be required for. */
export const livenessCheckpointPurposes = ['grant_access'] as const;
export type LivenessCheckpointPurpose = (typeof livenessCheckpointPurposes)[number];

/**
 * Only the fields the UI actually needs. The API decides entirely on its own
 * whether a check is due; the client never reproduces that logic, and anything
 * else the response carries is deliberately not picked up here.
 */
export const livenessCheckpointStatusSchema = z.object({
  purpose: z.enum(livenessCheckpointPurposes),
  satisfied: z.boolean(),
  challengeStatus: z.enum(['pending', 'approved', 'rejected', 'expired']).nullable(),
  locked: z.boolean(),
});

export type LivenessCheckpointStatus = z.infer<typeof livenessCheckpointStatusSchema>;

export async function getLivenessCheckpointStatus(f = fetch, purpose: LivenessCheckpointPurpose) {
  return parseRes(
    livenessCheckpointStatusSchema,
    await authenticatedCall(f, `/api/liveness-checkpoints/status?purpose=${purpose}`, {
      method: 'GET',
    }),
  );
}

/**
 * Re-throws anything that isn't the API refusing on a due checkpoint; for that
 * one, redirects into the challenge flow instead.
 *
 * Whether a check is due is a question only the API can answer, and only per
 * *grant*: grants belonging to a KYB'd org are exempt, because their withdrawers
 * are vouched for by the company record rather than by a personal identity
 * check. None of that is visible from a user-level status call, so the client
 * finds out by making the request it actually wants and reacting to the refusal.
 *
 * Pre-gating on `getLivenessCheckpointStatus` instead is what sent KYB
 * withdrawers — who have no personal KYC by design — into the `kyc-required`
 * dead end.
 */
export function handleCheckpointRequired(err: unknown, backTo: string): never {
  if (!(err instanceof LivenessCheckpointRequiredError)) throw err;

  throw redirect(302, `/wave/checkpoint?backTo=${encodeURIComponent(backTo)}`);
}

/**
 * Starts (or resumes) a check and returns a SumSub token scoped to it. Throws
 * if the user isn't currently allowed to start one.
 */
export async function startLivenessCheckpoint(f = fetch, purpose: LivenessCheckpointPurpose) {
  return parseRes(
    z.object({
      accessToken: z.string(),
      checkpointId: z.uuid(),
    }),
    await authenticatedCall(f, `/api/liveness-checkpoints/session`, {
      method: 'POST',
      body: JSON.stringify({ purpose }),
    }),
  );
}
