import { redirect } from '@sveltejs/kit';

import performLogin from './perform-login.js';

export const load = async ({ url }) => {
  await performLogin(url);

  return redirect(302, `/wave/login?backTo=${url.searchParams.get('backTo') || ''}`);
};

export const ssr = false;
