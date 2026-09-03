import { redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
  const { report, orgReports } = await parent();

  // The contributor tab is the default, but when the user has no contributor
  // report for this wave and at least one of their orgs has one, the
  // maintainer tab is more relevant.
  const hasAnyOrgReport = orgReports.some((entry) => entry.report !== null);
  const tab = report === null && hasAnyOrgReport ? 'maintainer' : 'contributor';

  throw redirect(302, `/wave/reports/${tab}${url.search}`);
};
