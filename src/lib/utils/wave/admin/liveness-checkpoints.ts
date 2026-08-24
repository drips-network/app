import { z } from 'zod';
import { authenticatedCall } from '../call';
import parseRes from '../utils/parse-res';

const checkpointPurposeEnum = z.enum(['grant_access']);
export type CheckpointPurpose = z.infer<typeof checkpointPurposeEnum>;

// Deliberately narrower than the API response: this client parses only what the
// screen renders, so fields the UI has no use for don't end up mirrored here.
const checkpointAttemptSchema = z.object({
  id: z.uuid(),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
  // Rendered because a pass is only honoured on the device that earned it, so
  // "which device was this from" is often the answer to why a user who looks
  // like they passed is still being asked to pass again.
  deviceId: z.uuid(),
  rejectLabels: z.array(z.string()).nullable(),
  createdAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
});
export type CheckpointAttempt = z.infer<typeof checkpointAttemptSchema>;

const checkpointPurposeStateSchema = z.object({
  purpose: checkpointPurposeEnum,
  enabled: z.boolean(),
  hasApprovalOnSomeDevice: z.boolean(),
  approvedDeviceId: z.uuid().nullable(),
  validUntil: z.coerce.date().nullable(),
  failedAttempts: z.object({
    used: z.number().int(),
    max: z.number().int(),
    exhausted: z.boolean(),
    naturalResetAt: z.coerce.date().nullable(),
  }),
  starts: z.object({
    used: z.number().int(),
    max: z.number().int(),
    exhausted: z.boolean(),
  }),
  lastReset: z
    .object({
      at: z.coerce.date(),
      reason: z.string(),
      resetByUserId: z.uuid().nullable(),
    })
    .nullable(),
  exemption: z
    .object({
      id: z.uuid(),
      grantedAt: z.coerce.date(),
      reason: z.string(),
      grantedByUserId: z.uuid().nullable(),
    })
    .nullable(),
  recentAttempts: z.array(checkpointAttemptSchema),
});
export type CheckpointPurposeState = z.infer<typeof checkpointPurposeStateSchema>;

const checkpointStatusSchema = z.object({
  userId: z.uuid(),
  purposes: z.array(checkpointPurposeStateSchema),
});
export type CheckpointStatus = z.infer<typeof checkpointStatusSchema>;

const resetResponseSchema = z.object({
  userId: z.uuid(),
  purpose: checkpointPurposeEnum,
  resetAt: z.coerce.date(),
  clearedFailedAttempts: z.number().int(),
  clearedStarts: z.number().int(),
});
export type ResetCheckpointResponse = z.infer<typeof resetResponseSchema>;

export async function getLivenessCheckpointStatus(
  f = fetch,
  userId: string,
): Promise<CheckpointStatus> {
  return parseRes(
    checkpointStatusSchema,
    await authenticatedCall(f, `/api/admin/liveness-checkpoints/${userId}`),
  );
}

const exemptionSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  purpose: checkpointPurposeEnum,
  reason: z.string(),
  grantedAt: z.coerce.date(),
  revokedAt: z.coerce.date().nullable(),
});
export type CheckpointExemption = z.infer<typeof exemptionSchema>;

export async function resetLivenessCheckpoint(
  f = fetch,
  userId: string,
  purpose: CheckpointPurpose,
  reason: string,
): Promise<ResetCheckpointResponse> {
  return parseRes(
    resetResponseSchema,
    await authenticatedCall(f, `/api/admin/liveness-checkpoints/${userId}/reset`, {
      method: 'POST',
      body: JSON.stringify({ purpose, reason }),
    }),
  );
}

export async function grantLivenessCheckpointExemption(
  f = fetch,
  userId: string,
  purpose: CheckpointPurpose,
  reason: string,
): Promise<CheckpointExemption> {
  return parseRes(
    exemptionSchema,
    await authenticatedCall(f, `/api/admin/liveness-checkpoints/${userId}/exemption`, {
      method: 'POST',
      body: JSON.stringify({ purpose, reason }),
    }),
  );
}

export async function revokeLivenessCheckpointExemption(
  f = fetch,
  userId: string,
  purpose: CheckpointPurpose,
  reason?: string,
): Promise<CheckpointExemption> {
  return parseRes(
    exemptionSchema,
    await authenticatedCall(f, `/api/admin/liveness-checkpoints/${userId}/exemption/revoke`, {
      method: 'POST',
      body: JSON.stringify({ purpose, ...(reason ? { reason } : {}) }),
    }),
  );
}
