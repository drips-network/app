import { gql } from 'graphql-request';
import type { ChainStatsQuery, ChainStatsQueryVariables } from './__generated__/gql.generated';
import query from '$lib/graphql/dripsQL';
import network from '$lib/stores/wallet/network';

export const chainStatsQuery = gql`
  query ChainStats($chains: [SupportedChain!]) {
    chainStats(chains: $chains) {
      chain
      claimedProjectsCount
      dripListsCount
      receiversCount
    }
  }
`;

export default async function fetchChainStats(f: typeof fetch) {
  const res = await query<ChainStatsQuery, ChainStatsQueryVariables>(
    chainStatsQuery,
    {
      chains: [network.gqlName],
    },
    f,
  );

  return res.chainStats[0];
}
