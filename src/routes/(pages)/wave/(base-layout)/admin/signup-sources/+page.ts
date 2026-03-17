import { listSignupSources } from '$lib/utils/wave/signupSources.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, depends }) => {
  depends('wave:admin:signup-sources');

  const { user } = await parent();

  if (!user.permissions?.includes('manageAttributionSources')) {
    throw redirect(302, '/wave/admin');
  }

  const signupSources = await listSignupSources(fetch, { limit: 100 });

  return {
    signupSources,
  };
};
