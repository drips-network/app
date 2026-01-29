import { redirect } from '@sveltejs/kit';

export const load = async ({ url, parent }) => {
  const { phoneVerificationStatus } = await parent();

  const backTo = url.searchParams.get('backTo') || '';

  if (phoneVerificationStatus.status !== 'verified') {
    throw redirect(302, `/wave/verify-phone?backTo=${encodeURIComponent(backTo)}`);
  }

  return {
    backTo,
  };
};
