import { getApplication, getKycRequestForApplication } from '$lib/utils/rpgf/rpgf.js';
import { error } from '@sveltejs/kit';
import { fetchProjectForApplication } from './shared/fetch-project-for-application.js';

export const load = async ({ fetch, params, parent, depends }) => {
  depends('rpgf:round:applications');

  const { round, rpgfUserData } = await parent();
  const authenticated = Boolean(rpgfUserData);

  const application = await getApplication(fetch, round.id, params.id);
  const isOwnApplication = rpgfUserData?.userId === application.submitter.id;

  const [dripsProject, kycRequest] = await Promise.all([
    fetchProjectForApplication(fetch, application.latestVersion.dripsAccountId),
    authenticated && (isOwnApplication || round.isAdmin) && round.kycConfig
      ? getKycRequestForApplication(fetch, application.id)
      : null,
  ]);

  if (!dripsProject) {
    throw error(404, 'Project not found');
  }

  return {
    application,
    kycRequest,
    dripsProject,
  };
};
