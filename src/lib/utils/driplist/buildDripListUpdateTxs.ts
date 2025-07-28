import { get } from 'svelte/store';
import type { SdkSplitsReceiver } from '@drips-network/sdk';
import type { Items, Weights } from '$lib/components/list-editor/types';
import type { TransactionWrapper } from '$lib/components/stepper/types';
import sdkStore from '$lib/stores/sdk/sdk.store';
import { transformItemsToSdkReceivers } from '../transformItemsToSdkReceivers';

export interface DripListUpdateContext {
  dripListAccountId: string;
  name?: string;
  description?: string;
  isVisible?: boolean;
  weights?: Weights;
  items?: Items;
}

export async function buildDripListUpdateTxs(context: DripListUpdateContext) {
  const sdk = get(sdkStore).sdk;
  if (!sdk) throw new Error('SDK not initialized');

  const dripListId = BigInt(context.dripListAccountId);

  const updateConfig: {
    dripListId: bigint;
    metadata?: {
      name?: string;
      description?: string;
      isVisible?: boolean;
    };
    receivers?: SdkSplitsReceiver[];
  } = {
    dripListId,
  };

  const hasMetadataUpdates =
    context.name !== undefined ||
    context.description !== undefined ||
    context.isVisible !== undefined;

  if (hasMetadataUpdates) {
    updateConfig.metadata = {};
    if (context.name !== undefined) updateConfig.metadata.name = context.name;
    if (context.description !== undefined) updateConfig.metadata.description = context.description;
    if (context.isVisible !== undefined) updateConfig.metadata.isVisible = context.isVisible;
  }

  if (context.weights && context.items) {
    updateConfig.receivers = await transformItemsToSdkReceivers(context.weights, context.items);
  }

  if (!hasMetadataUpdates && !updateConfig.receivers) {
    throw new Error('No updates provided: must specify metadata changes or receiver changes');
  }

  const prepareDripListUpdateResult = await sdk.dripLists.prepareUpdate(updateConfig);

  const txs: TransactionWrapper[] = [
    {
      title: 'Updating the Drip List',
      transaction: prepareDripListUpdateResult.preparedTx,
      applyGasBuffer: true,
    },
  ];

  return {
    txs,
    dripListId: dripListId.toString(),
    ipfsHash: prepareDripListUpdateResult.ipfsHash,
    metadata: prepareDripListUpdateResult.metadata,
  };
}
