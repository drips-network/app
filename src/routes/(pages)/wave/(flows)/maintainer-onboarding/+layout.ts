import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, '/wave/login?backTo=/wave/maintainer-onboarding/install-app');
  }
};
