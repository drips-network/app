import type { State } from '$lib/flows/create-drip-list-flow/create-drip-list-flow';
import type { TransactionWrapper } from '$lib/components/stepper/types';
import { sdkManager } from '$lib/utils/sdk/sdk-manager';
import { transformItemsToSdkReceivers } from '../transformItemsToSdkReceivers';

export async function buildDripListCreationTxs(context: State) {
  const sdk = sdkManager.sdk;
  if (!sdk) throw new Error('SDK not initialized');

  const prepareDripListCreationResult = await sdk.dripLists.prepareCreate({
    isVisible: true,
    name: context.dripList.title,
    description: context.dripList.description,
    receivers: await transformItemsToSdkReceivers(context.dripList.weights, context.dripList.items),
  });

  const txs = [
    {
      title: 'Creating the Drip List',
      transaction: prepareDripListCreationResult.preparedTx,
      applyGasBuffer: true,
    },
  ].filter(Boolean) as TransactionWrapper[];

  return {
    txs: txs,
    dripListId: prepareDripListCreationResult.dripListId.toString(),
  };
}
