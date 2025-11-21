import { logOut } from '$lib/utils/wave/auth';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export const load = async () => {
  await logOut();

  return redirect(302, '/wave');
};
