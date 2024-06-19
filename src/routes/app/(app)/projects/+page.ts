import { gql } from 'graphql-request';
import { PROJECTS_PAGE_PROJECT_FRAGMENT } from './+page.svelte';
import query from '$lib/graphql/dripsQL';
import type { ProjectsPageQuery, ProjectsPageQueryVariables } from './__generated__/gql.generated';
import { redirect } from '@sveltejs/kit';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    throw redirect(307, buildUrl('/app/connect', { backTo: '/app/projects' }));
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
