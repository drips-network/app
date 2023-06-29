import type { Split as RepresentationalSplit, Split } from '$lib/components/splits/splits.svelte';
import GitProjectService from '../project/GitProjectService';
import assert from '$lib/utils/assert';
import { AddressDriverClient, Utils } from 'radicle-drips';
import { getSubgraphClient } from '../get-drips-clients';

/**
 * Fetch splits for a given user ID, and map to representational splits for the `Splits` component.
 * @param userId The user ID to build representational splits for.
 * @returns Representational splits.
 */
export async function getRepresentationalSplitsForAccount(userId: string) {
  const subgraph = getSubgraphClient();

  const splits = await subgraph.getSplitsConfigByUserId(userId);

  return await buildRepresentationalSplits(
    splits.map((s) => ({
      account: {
        userId: s.userId,
      },
      weight: Number(s.weight),
    })),
  );
}

/**
 * Map project splits to representational splits for the `Splits` component.
 * @param splits The GitProject splits to map.
 * @returns The mapped representational splits for `Splits` component.
 */
export async function buildRepresentationalSplits(
  splits: { account: { userId: string }; weight: number }[],
): Promise<RepresentationalSplit[]> {
  const gitProjectService = await GitProjectService.new();

  const promises = splits.map((s) =>
    (async () => {
      const splitType = Utils.UserId.getDriver(s.account.userId);

      if (splitType === 'repo') {
        const project = await gitProjectService.getByUserId(s.account.userId);
        assert(project, `Unable to locate RepoDriver account with user ID ${s.account.userId}`);

        return {
          type: 'project-split',
          project,
          weight: s.weight,
        } as Split;
      } else {
        return {
          type: 'address-split',
          address: AddressDriverClient.getUserAddress(s.account.userId),
          weight: s.weight,
        } as Split;
      }
    })(),
  );

  return Promise.all(promises);
}
