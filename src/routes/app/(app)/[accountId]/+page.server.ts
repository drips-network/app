import { DRIP_LISTS_SECTION_DRIP_LIST_FRAGMENT } from '$lib/components/drip-lists-section/drip-lists-section.svelte';
import { PROJECTS_SECTION_PROJECT_FRAGMENT } from '$lib/components/projects-section/projects-section.svelte';
import { error, redirect } from '@sveltejs/kit';
import { gql } from 'graphql-request';
import { STREAMS_SECTION_STREAMS_FRAGMENT } from '../funds/sections/streams.section.svelte';
import { USER_BALANCES_FRAGMENT } from '../funds/sections/balances.section.svelte';
import network from '$lib/stores/wallet/network';
import { AddressDriverClient, Utils } from 'radicle-drips';
import query from '$lib/graphql/dripsQL';
import type { ProfilePageQuery, ProfilePageQueryVariables } from './__generated__/gql.generated';
import { getVotingRounds } from '$lib/utils/multiplayer';
import { mapSplitsFromMultiplayerResults } from '$lib/components/splits/splits.svelte';
import { SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT } from '$lib/components/supporters-section/supporters.section.svelte';
import { isAddress, JsonRpcProvider } from 'ethers';

const provider = new JsonRpcProvider(network.rpcUrl);

const PROFILE_PAGE_QUERY = gql`
  ${PROJECTS_SECTION_PROJECT_FRAGMENT}
  ${DRIP_LISTS_SECTION_DRIP_LIST_FRAGMENT}
  ${STREAMS_SECTION_STREAMS_FRAGMENT}
  ${USER_BALANCES_FRAGMENT}
  ${SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT}
  query ProfilePage($address: String!) {
    userByAddress(address: $address) {
      account {
        address
        accountId
      }
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
    }
  }
`;

async function resolveEnsFields(address: string) {
  try {
    const ensName = await provider.lookupAddress(address);

    if (ensName) {
      const resolver = await provider.getResolver(ensName);

      const promises = ['description', 'url', 'com.twitter', 'com.github'].map(
        async (recordName) => [recordName, await resolver?.getText(recordName)],
      );

      return {
        ensName,
        records: Object.fromEntries(await Promise.all(promises)),
      };
    }
  } catch {
    return null;
  }
}

export const load = async ({ params, fetch }) => {
  // Account ID here may be either a Drips Account ID, ENS name or an Ethereum address
  const { accountId: universalAccountId } = params;

  let address: string;

  if (isAddress(universalAccountId)) {
    address = universalAccountId;
  } else if ((universalAccountId as string).endsWith('.eth')) {
    const lookupRes = await provider.resolveName(universalAccountId);

    if (!lookupRes) {
      return { error: true, type: 'ens-not-resolved' as const };
    }

    address = lookupRes;
  } else if (/^\d+$/.test(universalAccountId)) {
    const driver = Utils.AccountId.getDriver(universalAccountId);

    switch (driver) {
      case 'address': {
        address = AddressDriverClient.getUserAddress(universalAccountId);
        break;
      }
      case 'nft': {
        redirect(301, `/app/drip-lists/${universalAccountId}`);
        break;
      }
      case 'repo': {
        return { error: true, type: 'is-repo-driver-account-id' as const };
        break;
      }
      default: {
        error(404, 'Not Found');
      }
    }
  } else {
    error(404, 'Not Found');
  }

  const [votingRounds, userRes, ensData] = await Promise.all([
    await getVotingRounds({ publisherAddress: address }, fetch),
    query<ProfilePageQuery, ProfilePageQueryVariables>(PROFILE_PAGE_QUERY, { address }, fetch),
    resolveEnsFields(address),
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
  };
};
