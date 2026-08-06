import { safeParseBackToParam } from '$lib/utils/safe-path';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
  const { checkpoint } = await parent();

  const backTo = safeParseBackToParam(url) || '/wave/rewards';

  // Nothing to ask for — either they're already through or the checkpoint
  // doesn't apply to them.
  if (checkpoint.satisfied) {
    throw redirect(302, backTo);
  }

  return {
    checkpoint,
    backTo,
  };
};
