import z from 'zod';
import { authenticatedCall } from './call';
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
