import { gql } from 'graphql-request';
import { PROJECTS_PAGE_PROJECT_FRAGMENT } from './+page.svelte';
import query from '$lib/graphql/dripsQL';
import type { ProjectsPageQuery, ProjectsPageQueryVariables } from './__generated__/gql.generated';
import { redirect } from '@sveltejs/kit';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import network from '$lib/stores/wallet/network';

const fetchedDataCache = makeFetchedDataCache<ProjectsPageQuery>('dashboard:projects');

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    redirect(307, buildUrl('/app/connect', { backTo: '/app/projects' }));
  }

  const projectsQuery = gql`
    ${PROJECTS_PAGE_PROJECT_FRAGMENT}
    query ProjectsPage($address: String, $chains: [SupportedChain!]) {
      projects(chains: $chains, where: { ownerAddress: $address }) {
        ...ProjectsPageProject
      }
    }
  `;

  const res =
    fetchedDataCache.read() ??
    (await query<ProjectsPageQuery, ProjectsPageQueryVariables>(
      projectsQuery,
      { address: connectedAddress, chains: [network.gqlName] },
      fetch,
    ));

  fetchedDataCache.write(res);

  return { projects: res.projects };
};

export const ssr = false;
