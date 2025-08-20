import type { TransactionWrapper } from '$lib/components/stepper/types';
import { sdkManager } from '$lib/utils/sdk/sdk-manager';
import { transformItemsToSdkReceivers } from '../transformItemsToSdkReceivers';
import type { Items, Weights } from '$lib/components/list-editor/types';

export interface VotingRoundDripListCreationContext {
  title: string;
  description?: string;
  weights: Weights;
  items: Items;
  votingRoundId: string;
  isVisible?: boolean;
}

export async function buildVotingRoundDripListCreationTxs(
  context: VotingRoundDripListCreationContext,
) {
  const sdk = sdkManager.sdk;
  if (!sdk) throw new Error('SDK not initialized');

  const prepareDripListCreationResult = await sdk.dripLists.prepareCreate({
    isVisible: context.isVisible ?? true,
    name: context.title,
    description: context.description,
    receivers: await transformItemsToSdkReceivers(context.weights, context.items),
    latestVotingRoundId: context.votingRoundId,
  });

  const txs: TransactionWrapper[] = [
    {
      title: 'Creating the Drip List',
      transaction: prepareDripListCreationResult.preparedTx,
      applyGasBuffer: true,
    },
  ];

  return {
    txs,
    dripListId: prepareDripListCreationResult.dripListId.toString(),
  };
}
