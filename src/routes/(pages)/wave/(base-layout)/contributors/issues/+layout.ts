import { issuesPageLayoutLoad } from '$lib/components/wave/issues-page/load-fns/issues-page-layout-load.js';
import { redirect } from '@sveltejs/kit';

export const load = async (context) => {
  const { phoneVerificationRequired } = await context.parent();

  if (phoneVerificationRequired?.required && !phoneVerificationRequired.isVerified) {
    throw redirect(
      302,
      `/wave/verify-phone?backTo=${encodeURIComponent(context.url.pathname + context.url.search)}`,
    );
  }

  return issuesPageLayoutLoad(context, (user) => ({
    requireLogin: true,
    preappliedFilters: {
      isInWaveProgram: true,
      appliedToByUser: user?.id,
      appliedToByUserCurrentWave: true,
    },
    defaultFilters: {},
    pathPrefix: '/wave/contributors/issues/',
    filtersMode: 'contributor',
    breadcrumbs: [{ label: 'Contributor Dashboard' }, { label: 'Issues' }],
    viewKey: 'contributors',
    headMetaTitle: 'Contributor dashboard',
    emptyStateAnnotation:
      "This view only shows issues that you've previously applied to. Head to the Explore tab to discover Waves and apply for an issue.",
  }));
};
