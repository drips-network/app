import { DRIP_LISTS_SECTION_DRIP_LIST_FRAGMENT } from '$lib/components/your-drip-lists-section/your-drip-lists-section.svelte';
import { PROJECTS_SECTION_PROJECT_FRAGMENT } from '$lib/components/your-projects-section/your-projects-section.svelte';
import { error, redirect } from '@sveltejs/kit';
import { gql } from 'graphql-request';
import { STREAMS_SECTION_STREAMS_FRAGMENT } from '../funds/sections/streams.section.svelte';
import { USER_BALANCES_FRAGMENT } from '../funds/sections/balances.section.svelte';
import network from '$lib/stores/wallet/network';
import query from '$lib/graphql/dripsQL';
import type { ProfilePageQuery, ProfilePageQueryVariables } from './__generated__/gql.generated';
import { getVotingRounds } from '$lib/utils/multiplayer';
import { mapSplitsFromMultiplayerResults } from '$lib/components/splits/utils';
import { SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT } from '$lib/components/supporters-section/supporters.section.svelte';
import { resolveAccountIdToAddress } from '$lib/utils/sdk/utils/resolve-account-id-to-address';
import { getMainnetProvider, resolveEnsProfile } from '$lib/stores/ens/ens';
import { JsonRpcProvider } from 'ethers';
import { LINKED_IDENTITIES_CARD_FRAGMENT } from './components/linked-identities-card.svelte';

const currentNetworkProvider = new JsonRpcProvider(network.rpcUrl);

const mainnetProvider = network.enableEns ? getMainnetProvider() : null;

const PROFILE_PAGE_QUERY = gql`
  ${PROJECTS_SECTION_PROJECT_FRAGMENT}
  ${DRIP_LISTS_SECTION_DRIP_LIST_FRAGMENT}
  ${STREAMS_SECTION_STREAMS_FRAGMENT}
  ${USER_BALANCES_FRAGMENT}
  ${SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT}
  ${LINKED_IDENTITIES_CARD_FRAGMENT}
  query ProfilePage($address: String!, $chains: [SupportedChain!]) {
    userByAddress(address: $address, chains: $chains) {
      account {
        driver
        address
        accountId
      }
      chainData {
        chain
        balances {
          ...UserBalances
        }
        dripLists {
          ...DripListsSectionDripList
        }
        projects {
          ...ProjectsSectionProject
        }
        streams {
          ...StreamsSectionStreams
        }
        support {
          ...SupportersSectionSupportItem
        }
        linkedIdentities {
          ...LinkedIdentities
        }
      }
    }
  }
`;

export const load = async ({ params, fetch }) => {
  // Account ID here may be either a Drips Account ID, ENS name or an Ethereum address
  const { accountId: universalAccountId } = params;

  const resolution = await resolveAccountIdToAddress(
    universalAccountId,
    currentNetworkProvider,
    mainnetProvider,
    network.chainId,
  );

  let address: string;

  switch (resolution.type) {
    case 'success':
      address = resolution.address;
      break;
    case 'driver-account':
      if (resolution.driver === 'nft') {
        return redirect(301, `/app/drip-lists/${resolution.accountId}`);
      }

      if (resolution.driver === 'repo') {
        return { error: true, type: 'is-repo-driver-account-id' as const };
      }

      return error(404, 'Not Found');
    case 'ens-not-resolved':
      return { error: true, type: 'ens-not-resolved' as const };
    case 'not-found':
    default:
      error(404, 'Not Found');
  }

  const [votingRounds, userRes, ensData] = await Promise.all([
    getVotingRounds({ publisherAddress: address }, fetch),
    query<ProfilePageQuery, ProfilePageQueryVariables>(
      PROFILE_PAGE_QUERY,
      { address, chains: [network.gqlName] },
      fetch,
    ),
    resolveEnsProfile(address, currentNetworkProvider, mainnetProvider, network.chainId),
  ]);

  const votingRoundsWithResults = votingRounds.filter((v) => v.result);

  const votingRoundsSplits = await Promise.all(
    votingRoundsWithResults.map((v) => v.result && mapSplitsFromMultiplayerResults(v.result)),
  );

  const votingRoundsWithSplits = votingRounds.map((v) => ({
    ...v,
    splits: votingRoundsSplits[votingRoundsWithResults.findIndex((vR) => vR.id === v.id)] ?? [],
  }));

  return {
    blockWhileInitializing: false,
    error: false,
    ensData,
    profileData: {
      ...userRes.userByAddress,
      votingRounds: votingRoundsWithSplits,
    },
    preservePathOnNetworkChange: true,
  };
};
