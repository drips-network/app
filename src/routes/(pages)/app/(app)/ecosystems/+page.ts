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
// import osoJson from '$lib/utils/csv-to-graph/__test__/data/fabricated-graph.json';

const fetchedDataCache = makeFetchedDataCache<ProjectsPageQuery>('dashboard:projects');

// const chicken = {
//   "name": "Fabricated Graph 2",
//   "description": "It's got metadata and theme data",
//   "chainId": "11155111",
//   "ownerAccountId": "1295444165478540595942340304482567097034602638723",
//   "ownerAddress": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
//   "avatar": {
//     "type": "emoji",
//     "emoji": "👽"
//   },
//   "color": "#27C537",
//   "metadata": [{
//       "icon": "Recipients",
//       "title": "MIT Licensed",
//       "text": "327",
//       "link": {
//         "href": "https://maps.app.goo.gl/cQFc5uDp1g1NQh488",
//         "label": "Castro Monte Mozinho"
//       }
//   }, {
//     "icon": "Wallet",
//     "title": "Source",
//     "text": "Based on data from",
//     "link": {
//         "href": "https://www.opensource.observer/",
//         "label": "Open Source Observer"
//     }
//   }, {
//     "icon": "Download",
//     "title": "Culinary Relations",
//     "link": {
//         "href": "https://maps.app.goo.gl/5PmHWtBCAjguoatB7",
//         "label": "Casa Da Viuva"
//     }
//   }, {
//     "icon": "Coin",
//     "title": "Fun Fact",
//     "text": "Dijkstra was apparently a huge a-hole.",
//     "link": {
//       "href": "https://drips.network",
//       "label": "Drips"
//     }
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

  // const ecosystems: Ecosystem[] = [];
  const ecosystems = await ecosystemsApi.getAll();
  // console.log(chicken)
  // if (ecosystems.length < 5) {
  //   console.log('Creating a chicken')
  //   const eco = await ecosystemsApi.create(chicken);
  //   ecosystems = await ecosystemsApi.getAll();
  // }

  // console.log(ecosystems);

  return { projects: res.projects, preservePathOnNetworkChange: true, ecosystems };
};

export const ssr = false;
