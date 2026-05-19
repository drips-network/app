import { z } from 'zod';
import { browser } from '$app/environment';
import getOptionalEnvVarPublic from '$lib/utils/get-optional-env-var/public';

const grantStatusEnum = z.enum([
  'withdrawable',
  'test_transaction_requested',
  'test_transaction_sent',
  'withdrawal_pending',
  'withdrawal_complete',
]);

const memoTypeEnum = z.enum(['text', 'id', 'hash', 'return']);

const sessionGrantSchema = z.object({
  id: z.uuid(),
  userId: z.uuid().nullable(),
  orgId: z.uuid().nullable(),
  isOrgGrant: z.boolean(),
  orgName: z.string().nullable(),
  waveProgramId: z.uuid(),
  waveProgramSlug: z.string(),
  waveProgramName: z.string(),
  waveId: z.uuid(),
  waveNumber: z.number().int(),
  type: z.string(),
  description: z.string().nullable(),
  initialAmountUSD: z.number().int(),
  currentAmountUSD: z.number().int(),
  status: grantStatusEnum,
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  recipientGitHubUsername: z.string(),
  transactions: z.array(
    z.object({
      id: z.uuid(),
      grantId: z.uuid(),
      type: z.enum(['test', 'withdrawal']),
      amountUSD: z.number().int(),
      stellarAddress: z.string(),
      memoType: memoTypeEnum.nullable(),
      memoValue: z.string().nullable(),
      status: z.enum(['pending', 'complete', 'cancelled']),
      transactionHash: z.string().nullable(),
      requestedByUserId: z.uuid().nullable(),
      requestedByGitHubUsername: z.string().nullable(),
      requestedAt: z.coerce.date(),
      completedAt: z.coerce.date().nullable(),
    }),
  ),
});

const sessionStateSchema = z.object({
  state: z.enum(['active', 'expired', 'revoked', 'grant_complete']),
  grant: sessionGrantSchema.nullable(),
  sessionExpiresAt: z.coerce.date().nullable(),
});

export type MagicLinkSessionState = z.infer<typeof sessionStateSchema>;

const PUBLIC_WAVE_API_URL = getOptionalEnvVarPublic(
  'PUBLIC_WAVE_API_URL',
  true,
  'Wave functionality will not work.',
);
const INTERNAL_WAVE_API_URL = getOptionalEnvVarPublic(
  'PUBLIC_INTERNAL_WAVE_API_URL',
  true,
  'Wave functionality will not work.',
);

const WAVE_API_URL = browser ? PUBLIC_WAVE_API_URL : INTERNAL_WAVE_API_URL;

export const load = async ({ fetch, depends }) => {
  depends('wave:magic-link-session');

  if (!WAVE_API_URL) {
    return {
      state: {
        state: 'revoked',
        grant: null,
        sessionExpiresAt: null,
      } satisfies MagicLinkSessionState,
    };
  }

  const res = await fetch(`${WAVE_API_URL}/api/grants/magic-links/session`, {
    credentials: 'include',
  });

  if (res.status === 403) {
    return {
      state: {
        state: 'revoked',
        grant: null,
        sessionExpiresAt: null,
      } satisfies MagicLinkSessionState,
    };
  }

  if (!res.ok) {
    throw new Error(`Failed to load magic-link session: ${res.status}`);
  }

  const json = await res.json();
  return { state: sessionStateSchema.parse(json) };
};
