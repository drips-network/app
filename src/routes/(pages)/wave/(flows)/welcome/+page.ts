import isSafePath from '$lib/utils/safe-path';

export const load = async ({ url }) => {
  const backTo = url.searchParams.get('backTo') || '/wave';
  const decoded = decodeURIComponent(backTo || '');

  const safeBackTo = isSafePath(decoded) ? decoded : '/wave';

  return {
    backTo: safeBackTo,
  };
};
