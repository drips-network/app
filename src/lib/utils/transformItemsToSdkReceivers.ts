import type { Items, Weights } from '$lib/components/list-editor/types';
import type { SdkSplitsReceiver } from '@drips-network/sdk';
import assert from '$lib/utils/assert';

export async function transformItemsToSdkReceivers(
  weights: Weights,
  items: Items,
): Promise<SdkSplitsReceiver[]> {
  const receivers: SdkSplitsReceiver[] = [];

  for (const [accountId, weight] of Object.entries(weights)) {
    assert(weight > 0n, 'Cannot transform item to SDK receiver: weight must be greater than 0');

    const item = items[accountId];

    switch (item.type) {
      case 'address':
        receivers.push({
          type: 'address',
          address: item.address as `0x${string}`,
          weight,
        });
        break;

      case 'project':
        receivers.push({
          type: 'project',
          url: item.project.source.url,
          weight,
        });
        break;

      case 'drip-list':
        receivers.push({
          type: 'drip-list',
          accountId: BigInt(item.dripList.account.accountId),
          weight,
        });
        break;
    }
  }

  return receivers;
}
