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
  // The org member the link was issued to (always set for grants owned by a
  // GitHub organization). Defaulted so an older API without the fields parses.
  recipientUserId: z.uuid().nullable().default(null),
  recipientGitHubUsername: z.string().nullable().default(null),
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
  isOrgGrant: z.boolean(),
  orgLogin: z.string().nullable(),
  /** `User` for an installation on the person's own account, `Organization` for a real org. */
  orgAccountType: z.enum(['User', 'Organization']).nullable().default(null),
  /** The searched user's GitHub role in the org, for real-org grants. */
  orgMemberRole: z.string().nullable().default(null),
  /**
   * True for grants owned by a real GitHub organization: the link is issued to
   * a designated member (the searched user), and the active link may belong to
   * another member.
   */
  requiresRecipient: z.boolean().default(false),
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

/**
 * Issues a magic link for a grant. `recipientUserId` names the Wave user the
 * link is for — required for grants owned by a GitHub organization (it must be
 * a current member), and otherwise optional but checked against the grant's
 * own recipient.
 */
export async function createMagicLink(
  f = fetch,
  grantId: string,
  recipientUserId?: string,
): Promise<CreateMagicLinkResponse> {
  return parseRes(
    createResponseSchema,
    await authenticatedCall(f, `/api/admin/grants/${grantId}/magic-links`, {
      method: 'POST',
      body: JSON.stringify(recipientUserId ? { recipientUserId } : {}),
    }),
  );
}

export async function revokeMagicLink(f = fetch, magicLinkId: string): Promise<void> {
  await authenticatedCall(f, `/api/admin/grants/magic-links/${magicLinkId}/revoke`, {
    method: 'POST',
  });
}
