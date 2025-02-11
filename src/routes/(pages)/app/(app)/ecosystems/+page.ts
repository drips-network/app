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
// import osoJson from '$lib/utils/csv-to-graph/__test__/data/oso-unweighted-graph-fake-weighted.json';

const fetchedDataCache = makeFetchedDataCache<ProjectsPageQuery>('dashboard:projects');

// const chicken = {
//   "name": "Wild Ecosystem",
//   "description": "It's wild and free",
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
//   "graph": {
//     "nodes": [
//         {
//             "projectName": "root"
//         },
//         {
//             "projectName": "drips-network/app"
//         },
//         {
//             "projectName": "drips-network/contracts"
//         },
//         {
//             "projectName": "drips-network/multiplayer"
//         },
//         {
//             "projectName": "drips-network/graphql-api"
//         },
//         {
//             "projectName": "drips-network/events-processor"
//         },
//         {
//             "projectName": "drips-network/sprinkler"
//         },
//         {
//             "projectName": "drips-network/search-sync"
//         },
//         {
//             "projectName": "drips-network/sdk"
//         },
//         {
//             "projectName": "jtourkos/typed-drips-example"
//         },
//         {
//             "projectName": "jtourkos/dt14"
//         },
//         {
//             "projectName": "jtourkos/dt15"
//         },
//         {
//             "projectName": "jtourkos/search-test"
//         },
//         {
//             "projectName": "jtourkos/tx-actions"
//         }
//     ],
//     "edges": [
//         {
//             "source": "root",
//             "target": "drips-network/app",
//             "weight": 40
//         },
//         {
//             "source": "root",
//             "target": "drips-network/contracts",
//             "weight": 60
//         },
//         {
//             "source": "drips-network/app",
//             "target": "drips-network/multiplayer",
//             "weight": 20
//         },
//         {
//             "source": "drips-network/app",
//             "target": "drips-network/graphql-api",
//             "weight": 20
//         },
//         {
//             "source": "drips-network/app",
//             "target": "drips-network/events-processor",
//             "weight": 60
//         },
//         {
//             "source": "drips-network/events-processor",
//             "target": "drips-network/sprinkler",
//             "weight": 30
//         },
//         {
//             "source": "drips-network/sprinkler",
//             "target": "drips-network/multiplayer",
//             "weight": 80
//         },
//         {
//             "source": "drips-network/contracts",
//             "target": "drips-network/events-processor",
//             "weight": 40
//         },
//         {
//             "source": "drips-network/events-processor",
//             "target": "drips-network/search-sync",
//             "weight": 60
//         },
//         {
//             "source": "drips-network/search-sync",
//             "target": "drips-network/sdk",
//             "weight": 75
//         },
//         {
//             "source": "drips-network/contracts",
//             "target": "jtourkos/typed-drips-example",
//             "weight": 30
//         },
//         {
//             "source": "jtourkos/typed-drips-example",
//             "target": "jtourkos/dt14",
//             "weight": 60
//         },
//         {
//             "source": "drips-network/contracts",
//             "target": "jtourkos/search-test",
//             "weight": 10
//         },
//         {
//             "source": "jtourkos/search-test",
//             "target": "jtourkos/tx-actions",
//             "weight": 60
//         },
//         {
//             "source": "drips-network/contracts",
//             "target": "jtourkos/dt15",
//             "weight": 20
//         },
//         {
//             "source": "jtourkos/dt15",
//             "target": "jtourkos/tx-actions",
//             "weight": 50
//         }
//     ]
// }
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
  // if (ecosystems.length < 2) {
  //   console.log('Creating a chicken')
  //   const eco = await ecosystemsApi.create(chicken);
  //   ecosystems = await ecosystemsApi.getAll();
  // }
  // eslint-disable-next-line no-console
  console.log(ecosystems);

  return { projects: res.projects, preservePathOnNetworkChange: true, ecosystems };
};

export const ssr = false;
