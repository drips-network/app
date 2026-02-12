import z from 'zod';
import { authenticatedCall, call } from './call';
import { linkedAccountDtoSchema } from './types/linked-accounts';
import parseRes from './utils/parse-res';

export async function getDiscordLinkUrl(returnUrl?: string) {
  const params = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';
  return parseRes(
    z.object({
      url: z.url(),
    }),
    await authenticatedCall(undefined, `/api/auth/oauth/discord/link${params}`),
  );
}

export async function redeemDiscordLink(code: string, state: string) {
  const res = await call('/api/auth/oauth/discord/redeem-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, state }),
    credentials: 'include',
  });

  const data = z
    .object({
      linkedAccount: linkedAccountDtoSchema,
    })
    .parse(res);

  return data;
}

export async function getLinkedAccounts(f = fetch) {
  return parseRes(
    z.object({
      linkedAccounts: z.array(linkedAccountDtoSchema),
    }),
    await authenticatedCall(f, '/api/user/linked-accounts'),
  );
}

export async function unlinkDiscordAccount(f = fetch) {
  await authenticatedCall(f, '/api/user/linked-accounts/discord', {
    method: 'DELETE',
  });
}
