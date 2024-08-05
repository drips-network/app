import { writable } from 'svelte/store';
import type { EditStreamFlowStreamFragment } from './__generated__/gql.generated';
import tokensStore from '$lib/stores/tokens/tokens.store';
import unreachable from '$lib/utils/unreachable';
import { formatUnits } from 'ethers';
import contractConstants from '$lib/utils/sdk/utils/contract-constants';

export interface EditStreamFlowState {
  newAmountValue: string | undefined;
  newName: string | undefined;
  newSelectedMultiplier: string;
}

export default (stream: EditStreamFlowStreamFragment) => {
  const token =
    tokensStore.getByAddress(stream.config.amountPerSecond.tokenAddress) ?? unreachable();

  return writable<EditStreamFlowState>({
    newAmountValue: formatUnits(
      BigInt(stream.config.amountPerSecond.amount) /
        BigInt(contractConstants.AMT_PER_SEC_MULTIPLIER),
      token.info.decimals,
    ),
    newName: stream.name ?? undefined,
    newSelectedMultiplier: '1',
  });
};
