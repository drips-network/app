import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
  const { user } = await parent();

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${encodeURIComponent(url.pathname)}`);
  }

  return {};
};
