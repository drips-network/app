import { getLinkedAccounts } from '$lib/utils/wave/discord.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url, fetch, depends }) => {
  depends('wave:linked-accounts');

  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname)}`);
  }

  const linkedAccountsResult = await getLinkedAccounts(fetch).catch(() => ({ linkedAccounts: [] }));
  const discordAccount = linkedAccountsResult.linkedAccounts.find((a) => a.provider === 'discord');

  return {
    discordAccount: discordAccount ?? null,
  };
};
