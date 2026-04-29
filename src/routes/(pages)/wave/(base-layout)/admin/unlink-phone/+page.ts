import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
  const { user } = await parent();

  if (!user.permissions?.includes('managePhoneVerifications')) {
    throw redirect(302, '/wave/admin');
  }

  return {};
};
