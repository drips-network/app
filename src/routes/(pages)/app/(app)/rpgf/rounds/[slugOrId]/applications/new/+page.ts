import { error, redirect } from '@sveltejs/kit';
import buildUrl from '$lib/utils/build-url';
import fetchApplicationFormData from '../shared/fetch-application-form-data.js';

export const load = async ({ fetch, url, parent }) => {
  const { rpgfUserData, round } = await parent();

  if (!rpgfUserData) {
    return redirect(
      307,
      buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }),
    );
  }
  if (round.state !== 'intake') {
    return error(404, 'This round is not accepting applications at this time');
  }

  const { projects, applicationForms, categories } = await fetchApplicationFormData(
    rpgfUserData.walletAddress,
    round.id,
    fetch,
  );

  return { projects, applicationForms, categories };
};

export const ssr = false;
