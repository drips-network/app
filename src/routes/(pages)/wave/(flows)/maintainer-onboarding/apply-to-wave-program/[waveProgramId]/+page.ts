import { getOrgs } from '$lib/utils/wave/orgs';
import { redirect } from '@sveltejs/kit';

export const load = async ({ fetch, params, parent }) => {
  const { applicationLimits } = await parent();

  // When the program imposes no limits at all, the limits step adds nothing —
  // skip straight to repo selection.
  const hasAnyLimit =
    applicationLimits.perUser.limit !== null ||
    applicationLimits.perOrg.some((org) => org.limit !== null);

  if (!hasAnyLimit) {
    throw redirect(
      302,
      `/wave/maintainer-onboarding/apply-to-wave-program/${params.waveProgramId}/select`,
    );
  }

  const ownOrgs = await getOrgs(fetch, { limit: 100 });

  return {
    ownOrgs,
  };
};
