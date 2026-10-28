import { safeParseBackToParam } from '$lib/utils/safe-path';

export const load = async ({ url }) => {
  const safeBackTo = safeParseBackToParam(url) || '/wave';

  return {
    backTo: safeBackTo,
  };
};
