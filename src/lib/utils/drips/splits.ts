import type {
  AddressSplit,
  DripListSplit,
  ProjectSplit,
} from '$lib/components/splits/splits.svelte';
import { AddressDriverClient } from 'radicle-drips';
import { getSubgraphClient } from '../get-drips-clients';
import type {
  AddressDriverSplitReceiver,
  DripListSplitReceiver,
  RepoDriverSplitReceiver,
} from '../metadata/types';
import assert from '$lib/utils/assert';
import NftDriverMetadataManager from '../metadata/NftDriverMetadataManager';
import { GitProjectService } from '../project/GitProjectService';

type RepresentationalSplit = AddressSplit | ProjectSplit | DripListSplit;

/**
 * Fetch splits for a given user ID, and map to representational splits for the `Splits` component.
 * @param accountId The user ID to build representational splits for.
 * @returns Representational splits.
 */
export async function getRepresentationalSplitsForAccount(
  accountId: string,
  projectSplitsMeta: (
    | RepoDriverSplitReceiver
    | AddressDriverSplitReceiver
    | DripListSplitReceiver
  )[] = [],
) {
  const subgraph = getSubgraphClient();

  const splits = await subgraph.getSplitsConfigByAccountId(accountId);

  return await buildRepresentationalSplits(
    splits.map((s) => ({
      account: {
        accountId: s.accountId,
      },
      weight: Number(s.weight),
    })),
    projectSplitsMeta,
  );
}

/**
 * Map project splits to representational splits for the `Splits` component.
 * @param splits The GitProject splits to map.
 * @returns The mapped representational splits for `Splits` component.
 */
export async function buildRepresentationalSplits(
  splits: { account: { accountId: string }; weight: number }[],
  splitsMeta: (RepoDriverSplitReceiver | AddressDriverSplitReceiver | DripListSplitReceiver)[] = [],
): Promise<RepresentationalSplit[]> {
  const gitProjectTxBuilder = await GitProjectService.new();
  const nftDriverMetadata = new NftDriverMetadataManager();
  const subgraph = getSubgraphClient();

  const promises = splits.map((s) =>
    (async () => {
      const matchingMetadata = splitsMeta.find((v) => v.account.accountId === s.account.accountId);

      if (matchingMetadata?.type === 'repo') {
        const project = await gitProjectTxBuilder.getProjectById(s.account.accountId);

        assert(project);

        return {
          type: 'project-split' as const,
          project,
          weight: s.weight,
        };
      } else if (matchingMetadata?.type === 'dripList') {
        const dripListMetadata = await nftDriverMetadata.fetchAccountMetadata(s.account.accountId);

        if (!dripListMetadata) {
          throw new Error(`No NFT Driver metadata found for splits entry ${s.account.accountId}`);
        }

        const owner = await subgraph.getNftSubAccountOwnerByTokenId(s.account.accountId);
        assert(owner);

        return {
          type: 'drip-list-split' as const,
          listId: matchingMetadata.account.accountId,
          listName: dripListMetadata.data.name ?? 'Unnamed Drip List',
          listOwner: owner.ownerAddress,
          weight: s.weight,
        };
      } else {
        return {
          type: 'address-split' as const,
          address: AddressDriverClient.getUserAddress(s.account.accountId),
          weight: s.weight,
        };
      }
    })(),
  );

  return Promise.all(promises);
}
