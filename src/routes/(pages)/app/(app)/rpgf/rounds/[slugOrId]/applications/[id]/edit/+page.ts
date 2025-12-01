import buildUrl from '$lib/utils/build-url';
import { error, redirect } from '@sveltejs/kit';
import fetchApplicationFormData from '../../shared/fetch-application-form-data';

export const load = async ({ parent, url, fetch }) => {
  const { application, rpgfUserData, round } = await parent();

  if (round.state !== 'intake') {
    throw error(403, 'Applications can only be edited during the intake phase');
  }

  if (!rpgfUserData) {
    redirect(307, buildUrl('/app/connect', { backTo: url.pathname, requireRpgfSignIn: 'true' }));
  }

  const isOwnApplication = rpgfUserData?.userId === application.submitter.id;
  if (!isOwnApplication) {
    throw error(403, 'You do not have permission to edit this application');
  }

  const { projects, applicationForms, categories } = await fetchApplicationFormData(
    rpgfUserData.walletAddress,
    round.id,
    fetch,
  );

  return { projects, applicationForms, categories };
};
