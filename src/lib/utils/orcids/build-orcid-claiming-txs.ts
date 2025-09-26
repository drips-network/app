import type { TransactionWrapper } from '$lib/components/stepper/types';
import { sdkManager } from '$lib/utils/sdk/sdk-manager';

export async function buildOrcidClaimingTxs(orcidId: string): Promise<{
  txs: TransactionWrapper[];
}> {
  const sdk = sdkManager.sdk;
  if (!sdk) throw new Error('SDK not initialized');

  const preparedTx = await sdk.linkedIdentities.prepareClaimOrcid({
    orcidId,
  });

  return {
    txs: [
      {
        title: 'Claim ORCID',
        transaction: preparedTx,
        applyGasBuffer: true,
      },
    ],
  };
}
