import { listBans, type RestrictionType } from '$lib/utils/wave/bans.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, depends, url }) => {
  depends('wave:admin:bans');

  const { user } = await parent();

  if (!user.permissions?.includes('manageBans')) {
    throw redirect(302, '/wave/admin');
  }

  const typeParam = url.searchParams.get('type');
  const type: RestrictionType | undefined =
    typeParam === 'ban' || typeParam === 'restriction' ? typeParam : undefined;

  const bans = await listBans(fetch, { pagination: { limit: 100 }, type });

  return {
    bans,
    type,
  };
};
