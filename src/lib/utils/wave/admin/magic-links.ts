import { z } from 'zod';
import { authenticatedCall } from '../call';
import parseRes from '../utils/parse-res';

const grantStatusEnum = z.enum([
  'withdrawable',
  'test_transaction_requested',
  'test_transaction_sent',
  'withdrawal_pending',
  'withdrawal_complete',
]);

const magicLinkActionEnum = z.enum(['test_transaction', 'withdrawal', 'withdrawal_cancel']);

const magicLinkUsageSchema = z.object({
  id: z.uuid(),
  action: magicLinkActionEnum,
  grantTransactionId: z.uuid().nullable(),
  createdAt: z.coerce.date(),
});

const magicLinkSchema = z.object({
  id: z.uuid(),
  grantId: z.uuid(),
  createdByUserId: z.uuid(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  revokedAt: z.coerce.date().nullable(),
  revokedByUserId: z.uuid().nullable(),
  state: z.enum(['active', 'expired', 'revoked', 'grant_complete']),
  usages: z.array(magicLinkUsageSchema),
});
export type MagicLinkDto = z.infer<typeof magicLinkSchema>;

const withdrawableGrantSummarySchema = z.object({
  id: z.uuid(),
  type: z.string(),
  description: z.string().nullable(),
  initialAmountUSD: z.number(),
  currentAmountUSD: z.number(),
  status: grantStatusEnum,
  expiresAt: z.coerce.date(),
  waveProgramSlug: z.string(),
  waveProgramName: z.string(),
  waveNumber: z.number().int(),
  activeMagicLink: magicLinkSchema.nullable(),
});
export type WithdrawableGrantSummary = z.infer<typeof withdrawableGrantSummarySchema>;

const withdrawableGrantsResponseSchema = z.object({
  user: z.object({
    id: z.uuid(),
    gitHubUserId: z.number().int(),
    gitHubUsername: z.string(),
    gitHubName: z.string().nullable(),
    gitHubAvatarUrl: z.string().nullable(),
  }),
  grants: z.array(withdrawableGrantSummarySchema),
});
export type WithdrawableGrantsResponse = z.infer<typeof withdrawableGrantsResponseSchema>;

const createResponseSchema = z.object({
  id: z.uuid(),
  url: z.url(),
  expiresAt: z.coerce.date(),
});
export type CreateMagicLinkResponse = z.infer<typeof createResponseSchema>;

export async function getWithdrawableGrantsForUser(
  f = fetch,
  gitHubUsername: string,
): Promise<WithdrawableGrantsResponse> {
  const params = new URLSearchParams({ gitHubUsername });
  return parseRes(
    withdrawableGrantsResponseSchema,
    await authenticatedCall(f, `/api/admin/grants/withdrawable?${params.toString()}`),
  );
}

export async function createMagicLink(
  f = fetch,
  grantId: string,
): Promise<CreateMagicLinkResponse> {
  return parseRes(
    createResponseSchema,
    await authenticatedCall(f, `/api/admin/grants/${grantId}/magic-links`, {
      method: 'POST',
    }),
  );
}

export async function revokeMagicLink(f = fetch, magicLinkId: string): Promise<void> {
  await authenticatedCall(f, `/api/admin/grants/magic-links/${magicLinkId}/revoke`, {
    method: 'POST',
  });
}
