import { writable } from 'svelte/store';
import type { EditStreamFlowStreamFragment } from './__generated__/gql.generated';
import { formatUnits } from 'ethers/lib/utils';
import tokensStore from '$lib/stores/tokens/tokens.store';
import unreachable from '$lib/utils/unreachable';

export interface EditStreamFlowState {
  newAmountValue: string | undefined;
  newName: string | undefined;
  newSelectedMultiplier: string;
}

export default (stream: EditStreamFlowStreamFragment) => {
  const token =
    tokensStore.getByAddress(stream.config.amountPerSecond.tokenAddress) ?? unreachable();

  return writable<EditStreamFlowState>({
    newAmountValue: formatUnits(stream.config.amountPerSecond.amount, token.info.decimals),
    newName: stream.name ?? undefined,
    newSelectedMultiplier: '1',
  });
};
