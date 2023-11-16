import DripListService from '$lib/utils/driplist/DripListService';
import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type { DripList, GitProject } from '$lib/utils/metadata/types';
import GitProjectService from '$lib/utils/project/GitProjectService';
import { Utils, AddressDriverClient } from 'radicle-drips';

export interface SplitsEntryWrapper<T> {
  value: T;
  weight: number;
}

export default async function getIncomingSplits(accountId: string): Promise<{
  users: SplitsEntryWrapper<{
    driver: 'address';
    address: string;
    accountId: string;
  }>[];
  projects: SplitsEntryWrapper<GitProject>[];
  dripLists: SplitsEntryWrapper<DripList>[];
}> {
  const subgraph = getSubgraphClient();
  const dripListService = await DripListService.new();
  const gitProjectService = await GitProjectService.new();

  const incomingSplits = await subgraph.getSplitEntriesByReceiverAccountId(accountId);

  const incomingAddressDriverSplits = incomingSplits.filter(
    (s) => Utils.AccountId.getDriver(s.senderId) === 'address',
  );

  const incomingNFTDriverSplits = incomingSplits.filter(
    (s) => Utils.AccountId.getDriver(s.senderId) === 'nft',
  );
  const dripListFetches = incomingNFTDriverSplits.map(async (s) => {
    const dripList = await dripListService.getByTokenId(s.senderId);
    if (!dripList) return undefined;

    return { value: dripList, weight: Number(s.weight) };
  });

  const incomingRepoDriverSplits = incomingSplits.filter(
    (s) => Utils.AccountId.getDriver(s.senderId) === 'repo',
  );

  const projectFetches = incomingRepoDriverSplits.map(async (s) => {
    const gitProject = await gitProjectService.getByAccountId(s.senderId);
    if (!gitProject) return undefined;

    return { value: gitProject, weight: Number(s.weight) };
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
    projects: mapFilterUndefined(fetchResults[1], (v) => v as SplitsEntryWrapper<GitProject>),
    dripLists: mapFilterUndefined(fetchResults[0], (v) => v as SplitsEntryWrapper<DripList>),
  };
}
