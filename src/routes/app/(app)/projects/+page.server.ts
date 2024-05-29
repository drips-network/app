import { gql } from 'graphql-request'
import { PROJECTS_PAGE_PROJECT_FRAGMENT } from './+page.svelte';
import query from '$lib/graphql/dripsQL';
import type { ProjectsPageQuery, ProjectsPageQueryVariables } from './__generated__/gql.generated';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch, cookies }) => {
  const connectedAddress = cookies.get('connected-address');

  if (!connectedAddress) {
    return error(401, 'Unauthorized');
  }

  const projectsQuery = gql`
    ${PROJECTS_PAGE_PROJECT_FRAGMENT}
    query ProjectsPage($address: String) {
      projects(where: {
        ownerAddress: $address
      }) {
        ...ProjectsPageProject
      }
    }
  `;

  const res = await query<ProjectsPageQuery, ProjectsPageQueryVariables>(projectsQuery, { address: connectedAddress }, fetch);

  return { projects: res.projects }
}
