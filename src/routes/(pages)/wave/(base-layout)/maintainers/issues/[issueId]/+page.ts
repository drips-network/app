import { issuePageLoad } from '$lib/components/wave/issues-page/load-fns/issue-page-load';

export const load = async (context) => {
  const { userOrgs } = await context.parent();

  return issuePageLoad(context, (issue) => ({
    allowAddingOrRemovingWave: true,
    backToConfig: { label: 'Back to issues', href: `/wave/maintainers/issues` },
    headMetaTitle: `${issue.title} | Maintainer Dashboard`,

    // on this view, we don't want to allow viewing issues that are not part of the user's orgs
    block: !userOrgs.data.some((userOrg) => userOrg.orgId === issue.repo.org.id)
      ? {
          errorCode: 401,
          message: 'This issue is not part of your organizations.',
        }
      : null,
  }));
};
