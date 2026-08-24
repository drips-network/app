import { safeParseBackToParam } from '$lib/utils/safe-path';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
  const { checkpoint } = await parent();

  const backTo = safeParseBackToParam(url) || '/wave/rewards';

  // Landing here without having passed means something went wrong on the way —
  // send them back to the start rather than showing a success screen.
  if (!checkpoint.satisfied) {
    throw redirect(302, `/wave/checkpoint?backTo=${encodeURIComponent(backTo)}`);
  }

  return {
    backTo,
  };
};
