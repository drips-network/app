import { getApplication, getKycRequestForApplication } from '$lib/utils/rpgf/rpgf.js';
import { error } from '@sveltejs/kit';
import { getRepoMetrics } from '$lib/utils/rpgf/oso.js';
import type { KycRequest } from '$lib/utils/rpgf/types/kyc.js';
import { fetchProjectForApplication } from './shared/fetch-project-for-application.js';

export const load = async ({ fetch, params, parent, depends }) => {
  depends('rpgf:round:applications');

  const { round, rpgfUserData } = await parent();
  const authenticated = Boolean(rpgfUserData);

  const application = await getApplication(fetch, round.id, params.id);
  const isOwnApplication = rpgfUserData?.userId === application.submitter.id;

  const dripsProject = await fetchProjectForApplication(
    fetch,
    application.latestVersion.dripsAccountId,
  );

  if (!dripsProject) {
    throw error(404, 'Project not found');
  }

  let kycRequest: KycRequest | null = null;
  if (authenticated && (isOwnApplication || round.isAdmin) && round.kycProvider) {
    kycRequest = await getKycRequestForApplication(fetch, application.id);
  }

  // Not awaiting this so that it gets streamed to the client
  const osoCoreMetrics = getRepoMetrics(
    dripsProject.source.ownerName,
    dripsProject.source.repoName,
    fetch,
  );

  return {
    application,
    kycRequest,
    dripsProject,
    osoCoreMetrics,
  };
};
