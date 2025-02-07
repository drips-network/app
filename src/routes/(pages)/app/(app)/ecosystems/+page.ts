import { gql } from 'graphql-request';
import { PROJECTS_PAGE_PROJECT_FRAGMENT } from './+page.svelte';
import query from '$lib/graphql/dripsQL';
import type { ProjectsPageQuery, ProjectsPageQueryVariables } from './__generated__/gql.generated';
import { redirect } from '@sveltejs/kit';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import network from '$lib/stores/wallet/network';
// import { ECOSYSTEM_API_URL, ECOSYSTEM_API_ACCESS_TOKEN } from '$env/static/private';
// import { ensureResponseOk } from '$lib/utils/fetch';
import * as ecosystemsApi from '$lib/utils/ecosystems';

const fetchedDataCache = makeFetchedDataCache<ProjectsPageQuery>('dashboard:projects');

// const fetchEcosystems = async (fetch: typeof window.fetch) => {
//   const ecosystems = await ecosystemsApi.getAll()
// }

//  const response = await fetch(
//    `${stripTrailingSlash(MULTIPLAYER_API_URL)}/${params.path}?${searchParams}`,
//    {
//      method: request.method,
//      body: body || undefined,
//      headers: {
//        Authorization: `Bearer ${MULTIPLAYER_API_ACCESS_TOKEN}`,
//        'Content-Type': 'application/json',
//      },
//    },
//  );

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    redirect(307, buildUrl('/app/connect', { backTo: '/app/ecosystems' }));
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

  const ecosystems = await ecosystemsApi.getAll();
  // eslint-disable-next-line no-console
  console.log(ecosystems);

  return { projects: res.projects, preservePathOnNetworkChange: true, ecosystems };
};

export const ssr = false;
