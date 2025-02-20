import { gql } from 'graphql-request';
import { PROJECTS_PAGE_PROJECT_FRAGMENT } from './+page.svelte';
import query from '$lib/graphql/dripsQL';
import type { ProjectsPageQuery, ProjectsPageQueryVariables } from './__generated__/gql.generated';
import { redirect } from '@sveltejs/kit';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import { makeFetchedDataCache } from '$lib/stores/fetched-data-cache/fetched-data-cache.store';
import network from '$lib/stores/wallet/network';
import * as ecosystemsApi from '$lib/utils/ecosystems';
// import osoJson from '$lib/utils/csv-to-graph/__test__/data/oso-unweighted-graph-fake-weighted-reduced.json';

const fetchedDataCache = makeFetchedDataCache<ProjectsPageQuery>('dashboard:projects');

// const chicken = {
//   "name": "Reduced 5000 0 Levels",
//   "description": "This graph is large",
//   "chainId": "11155111",
//   "ownerAccountId": "1295444165478540595942340304482567097034602638723",
//   "ownerAddress": "0xe2E9b9B5d0757c26aB477A754788B19b60f2ed83",
//   "metadata": [{
//       "icon": "icon",
//       "title": "title",
//       "text": "text",
//       "link": {
//           "href": "http://href.com",
//           "label": "label"
//       }
//   }],
//   "graph": osoJson
// }

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
  // console.log(chicken)
  // if (ecosystems.length < 9) {
  //   console.log('Creating a chicken')
  //   const eco = await ecosystemsApi.create(chicken);
  //   ecosystems = await ecosystemsApi.getAll();
  // }
  // eslint-disable-next-line no-console
  console.log(ecosystems);

  return { projects: res.projects, preservePathOnNetworkChange: true, ecosystems };
};

export const ssr = false;
