import type { Split as RepresentationalSplit, Split } from '$lib/components/splits/splits.svelte';
import GitProjectService from '../project/GitProjectService';
import { AddressDriverClient, Utils } from 'radicle-drips';
import { getSubgraphClient } from '../get-drips-clients';
import type { RepoDriverSplitReceiver } from '../metadata/types';

/**
 * Fetch splits for a given user ID, and map to representational splits for the `Splits` component.
 * @param accountId The user ID to build representational splits for.
 * @returns Representational splits.
 */
export async function getRepresentationalSplitsForAccount(accountId: string) {
  const subgraph = getSubgraphClient();

  const splits = await subgraph.getSplitsConfigByAccountId(accountId);

  return await buildRepresentationalSplits(
    splits.map((s) => ({
      account: {
        accountId: s.accountId,
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
  splits: { account: { accountId: string }; weight: number }[],
  projectSplitsMeta: RepoDriverSplitReceiver[] = [],
): Promise<RepresentationalSplit[]> {
  const gitProjectService = await GitProjectService.new();

  const promises = splits.map((s) =>
    (async () => {
      const splitType = Utils.AccountId.getDriver(s.account.accountId);

      if (splitType === 'repo') {
        const matchingMetadata = projectSplitsMeta.find(
          (v) => v.account.accountId === s.account.accountId,
        );

        const project = await gitProjectService.getByAccountId(
          s.account.accountId,
          true,
          matchingMetadata?.source,
        );

        return {
          type: 'project-split',
          project,
          weight: s.weight,
        } as Split;
      } else {
        return {
          type: 'address-split',
          address: AddressDriverClient.getUserAddress(s.account.accountId),
          weight: s.weight,
        } as Split;
      }
    })(),
  );

  return Promise.all(promises);
}
