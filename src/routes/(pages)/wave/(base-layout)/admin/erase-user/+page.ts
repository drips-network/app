import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
  const { user } = await parent();

  if (!user.permissions?.includes('eraseUsers')) {
    throw redirect(302, '/wave/admin');
  }

  return {};
};
