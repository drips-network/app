import type { TransactionWrapper } from '$lib/components/stepper/types';
import type { State } from '$lib/flows/claim-orcid-flow/claim-orcid-flow';
import { sdkManager } from '$lib/utils/sdk/sdk-manager';

export async function buildOrcidClaimingTxs(context: State): Promise<{
  txs: TransactionWrapper[];
}> {
  const sdk = sdkManager.sdk;
  if (!sdk) throw new Error('SDK not initialized');

  const preparedTx = await sdk.linkedIdentities.prepareClaimOrcid({
    orcidId: context.claimableId,
  });

  return {
    txs: [
      {
        title: 'Claim ORCID',
        transaction: preparedTx,
        // TODO: what should this be?
        gasless: false,
        applyGasBuffer: true,
      },
    ],
  };
}
