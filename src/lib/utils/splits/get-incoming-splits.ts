import query from '$lib/graphql/dripsQL';
import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { gql } from 'graphql-request';
import { Utils, AddressDriverClient } from 'radicle-drips';
import type { IncomingDripListSplitDripListQuery, IncomingDripListSplitDripListQueryVariables, IncomingProjectSplitProjectQuery, IncomingProjectSplitProjectQueryVariables } from './__generated__/gql.generated';

export interface SplitsEntryWrapper<T> {
  value: T;
  weight: number;
}

const incomingProjectSplitQuery = gql`
  query IncomingProjectSplitProject($projectId: ID!) {
    project(id: $projectId) {
      ... on ClaimedProject {
        source {
          ownerName
          repoName
          url
        }
      }
    }
  }
`

const incomingDripListSplitQuery = gql`
  query IncomingDripListSplitDripList($dripListId: ID!) {
    dripList(id: $dripListId) {
      name
      account {
        accountId
      }
      owner {
        address
      }
    }
  }
`

export default async function getIncomingSplits(forAccountId: string, fetchFunction: typeof fetch = fetch): Promise<{
  users: SplitsEntryWrapper<{
    driver: 'address';
    address: string;
    accountId: string;
  }>[];
  projects: SplitsEntryWrapper<NonNullable<IncomingProjectSplitProjectQuery['project']>>[]
  dripLists: SplitsEntryWrapper<NonNullable<IncomingDripListSplitDripListQuery['dripList']>>[];
}> {
  const subgraph = getSubgraphClient();

  const incomingSplits = await subgraph.getSplitEntriesByReceiverAccountId(forAccountId);

  const incomingAddressDriverSplits = incomingSplits.filter(
    (s) => Utils.AccountId.getDriver(s.senderId) === 'address',
  );

  const incomingNFTDriverSplits = incomingSplits.filter(
    (s) => Utils.AccountId.getDriver(s.senderId) === 'nft',
  );
  const dripListFetches = incomingNFTDriverSplits.map(async (s) => {
    const response = await query<IncomingDripListSplitDripListQuery, IncomingDripListSplitDripListQueryVariables>(incomingDripListSplitQuery, {
      dripListId: s.senderId,
    }, fetchFunction);

    const { dripList } = response;
    if (!dripList) return undefined;

    return { value: dripList, weight: Number(s.weight) };
  });

  const incomingRepoDriverSplits = incomingSplits.filter(
    (s) => Utils.AccountId.getDriver(s.senderId) === 'repo',
  );

  const projectFetches = incomingRepoDriverSplits.map(async (s) => {
    const response = await query<IncomingProjectSplitProjectQuery, IncomingProjectSplitProjectQueryVariables>(incomingProjectSplitQuery, {
      projectId: s.senderId,
    }, fetchFunction);

    const { project }= response;
    if (!project) return undefined;

    return { value: project, weight: Number(s.weight) };
  });

  const fetchResults = await Promise.all([
    Promise.all(dripListFetches),
    Promise.all(projectFetches),
  ]);

  return {
    users: incomingAddressDriverSplits.map((s) => ({
      weight: Number(s.weight),
      value: {
        address: AddressDriverClient.getUserAddress(s.senderId),
        driver: 'address',
        accountId: s.senderId,
      },
    })),
    projects: mapFilterUndefined(fetchResults[1], (v) => v as SplitsEntryWrapper<NonNullable<IncomingProjectSplitProjectQuery['project']>>),
    dripLists: mapFilterUndefined(fetchResults[0], (v) => v as SplitsEntryWrapper<NonNullable<IncomingDripListSplitDripListQuery['dripList']>>),
  };
}
