import { getOrgs } from '$lib/utils/wave/orgs.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, fetch, url, depends }) => {
  depends('wave:maintainer-onboarding-install-callback');

  const { user } = await parent();

  const installationId = url.searchParams.get('installation_id');

  if (!installationId) {
    throw redirect(302, '/wave/maintainer-onboarding/install-app');
  }

  if (!user) {
    throw redirect(302, `/wave/login?backTo=${url.pathname}${url.search}`);
  }

  const userOrgs = await getOrgs(fetch, { limit: 1 }, { gitHubInstallationId: installationId });

  const isInstalled = userOrgs.data.some(
    (uo) => uo.org.gitHubInstallationId === Number(installationId),
  );

  if (isInstalled) {
    throw redirect(302, '/wave/maintainer-onboarding/review-repos');
  }
};

export const ssr = false;
