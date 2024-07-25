import type { StepComponentEvents } from '$lib/components/stepper/types';
import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
import walletStore from '$lib/stores/wallet/wallet.store';
import { getCallerClient, getNetworkConfig } from '$lib/utils/get-drips-clients';
import { AddressDriverPresets } from 'radicle-drips';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';
import getOwnAccountId from '$lib/utils/sdk/utils/get-own-account-id';

export default function batchCollect(
  tokenAddresses: string[],
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
) {
  transact(
    dispatch,
    makeTransactPayload({
      before: async () => {
        const callerClient = await getCallerClient();
        const ownAccountId = await getOwnAccountId();
        const { address: userAddress, signer } = get(walletStore);

        assert(userAddress && signer);

        const { DRIPS, ADDRESS_DRIVER } = getNetworkConfig();

        const flowsPromises: ReturnType<
          (typeof AddressDriverPresets.Presets)['createCollectFlow']
        >[] = [];
        for (const tokenAddress of tokenAddresses) {
          const flow = AddressDriverPresets.Presets.createCollectFlow({
            signer,
            driverAddress: ADDRESS_DRIVER,
            dripsAddress: DRIPS,
            tokenAddress,
            maxCycles: 1000,
            currentReceivers: [],
            transferToAddress: userAddress,
            accountId: ownAccountId,
          });

          flowsPromises.push(flow);
        }

        const flows = await Promise.all(flowsPromises);
        const transactions = flows.flat();
        const tx = await callerClient.populateCallBatchedTx(transactions);

        return {
          tx,
          accountId: ownAccountId,
        };
      },

      transactions: ({ tx }) => [
        {
          transaction: tx,
          applyGasBuffer: true,
        },
      ],
    }),
  );
}
