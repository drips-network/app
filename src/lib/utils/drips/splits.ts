import type { Split as RepresentationalSplit, Split } from '$lib/components/splits/splits.svelte';
import type {
  AddressDriverSplitReceiver,
  RepoDriverSplitReceiver,
} from '$lib/utils/metadata/types';
import GitProjectService from '../project/GitProjectService';
import assert from '$lib/utils/assert';
import { AddressDriverClient } from 'radicle-drips';

/**
 * Map project splits to representational splits for the `Splits` component.
 * @param splits The GitProject splits to map.
 * @returns The mapped representational splits for `Splits` component.
 */
export async function buildRepresentationalSplits(
  splits: (AddressDriverSplitReceiver | RepoDriverSplitReceiver)[],
): Promise<RepresentationalSplit[]> {
  const gitProjectService = await GitProjectService.new();

  const promises = splits.map((s) =>
    (async () => {
      const splitType = 'source' in s ? 'repo' : 'address';

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
