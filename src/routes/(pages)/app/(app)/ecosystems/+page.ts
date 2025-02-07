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

const fetchedDataCache = makeFetchedDataCache<ProjectsPageQuery>('dashboard:projects');

// const chicken = {
//   "name": "Chicken Sandwich",
//   "chainId": "11155111",
//   "ownerAccountId": "ownerAccountId",
//   "metadata": {
//       "icon": "icon",
//       "title": "title",
//       "text": "text",
//       "link": {
//           "href": "http://href.com",
//           "label": "label"
//       }
//   },
//   "graph": {
//       "nodes": [
//           {
//               "projectName": "root"
//           },
//           {
//               "projectName": "drips-network/app",
//               "metadata": {
//                   "icon": "icon",
//                   "title": "title",
//                   "text": "text",
//                   "link": {
//                       "href": "http://href.com",
//                       "label": "label"
//                   }
//               }
//           },
//           {
//               "projectName": "drips-network/multiplayer"
//           },
//           {
//               "projectName": "drips-network/graphql-api"
//           }
//       ],
//       "edges": [
//           {
//               "source": "root",
//               "target": "drips-network/app",
//               "weight": 100
//           },
//           {
//               "source": "drips-network/app",
//               "target": "drips-network/multiplayer",
//               "weight": 0.1
//           },
//           {
//               "source": "drips-network/app",
//               "target": "drips-network/graphql-api",
//               "weight": 0.1
//           }
//       ]
//   }
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
  // if (!ecosystems.length) {
  //   console.log('Creating a chicken')
  //   const eco = await ecosystemsApi.create(chicken);
  //   ecosystems = await ecosystemsApi.getAll();
  // }
  // eslint-disable-next-line no-console
  console.log(ecosystems);

  return { projects: res.projects, preservePathOnNetworkChange: true, ecosystems };
};

export const ssr = false;
