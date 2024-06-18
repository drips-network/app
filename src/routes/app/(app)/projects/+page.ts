import { gql } from 'graphql-request';
import { PROJECTS_PAGE_PROJECT_FRAGMENT } from './+page.svelte';
import query from '$lib/graphql/dripsQL';
import type { ProjectsPageQuery, ProjectsPageQueryVariables } from './__generated__/gql.generated';
import { redirect } from '@sveltejs/kit';
import getCookieClientSide from '$lib/utils/get-cookie-clientside';
import buildUrl from '$lib/utils/build-url';

export const load = async ({ fetch }) => {
  const connectedAddress = getCookieClientSide('connected-address');

  if (!connectedAddress) {
    return redirect(307, buildUrl('/app/connect', { backTo: '/app/projects' }));
  }

  const projectsQuery = gql`
    ${PROJECTS_PAGE_PROJECT_FRAGMENT}
    query ProjectsPage($address: String) {
      projects(where: { ownerAddress: $address }) {
        ...ProjectsPageProject
      }
    }
  `;

  const res = await query<ProjectsPageQuery, ProjectsPageQueryVariables>(
    projectsQuery,
    { address: connectedAddress },
    fetch,
  );

  return { projects: res.projects };
};

export const ssr = false;
