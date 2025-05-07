import { redirect } from '@sveltejs/kit';
import buildUrl from '$lib/utils/build-url';
import getConnectedAddress from '$lib/utils/get-connected-address';
import * as ecosystemsApi from '$lib/utils/ecosystems';
import { fetchEcosystem } from './[ecosystemId]/fetch-ecosystem.js';
// import type { Ecosystem } from '$lib/utils/ecosystems/schemas.js';
// import type { EcosystemProfileFragment } from './[ecosystemId]/components/__generated__/gql.generated.js';
// import type { EcosystemProfileFragment } from './__generated__/gql.generated';
// import { ECOSYSTEMS_LISTINGS_ITEM_FRAGMENT } from './+page.svelte';
// import { gql } from 'graphql-request';
// import network from '$lib/stores/wallet/network';
// import { SortDirection } from '$lib/graphql/__generated__/base-types';
// import query from '$lib/graphql/dripsQL';

// const fetchEcosystems = async (fetch: typeof global.fetch) => {
//   const ecosystemsQuery = gql`
//     ${ECOSYSTEMS_LISTINGS_ITEM_FRAGMENT}
//     query Ecosystems(
//       $chain: SupportedChain!
//     ) {
//       ecosystemMainAccounts(chain: $chain) {
//         ...EcosystemsListingsItem
//       }
//     }
//   `;

//   return {
//     content: await query<EcosystemsQuery, EcosystemsQueryVariables>(
//       ecosystemsQuery,
//       {
//         chain: network.gqlName,
//       },
//       fetch,
//     ),
//     blockWhileInitializing: false,
//     preservePathOnNetworkChange: true,
//   };
// }

export const load = async ({ fetch }) => {
  const connectedAddress = getConnectedAddress();

  if (!connectedAddress) {
    redirect(307, buildUrl('/app/connect', { backTo: '/app/ecosystems' }));
  }

  const ecosystems = await ecosystemsApi.getAll();
  // TODO: slow
  for (const ecosystem of ecosystems) {
    if (ecosystem.accountId) {
      const ecosystemRes = await fetchEcosystem(ecosystem.accountId, fetch)
      // eslint-disable-next-line no-console
      console.log(ecosystemRes.ecosystemMainAccount)
    }
  }

  return { ecosystems };
};

export const ssr = false;
