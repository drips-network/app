import type { StepComponentEvents } from '$lib/components/stepper/types';
import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
import walletStore from '$lib/stores/wallet/wallet.store';
import { AddressDriverPresets } from 'radicle-drips';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';
import getOwnAccountId from '$lib/utils/sdk/utils/get-own-account-id';
import { getNetworkConfig } from '$lib/utils/sdk/utils/get-network-config';
import txToCallerCall from '$lib/utils/sdk/utils/tx-to-caller-call';
import { populateCallerWriteTx } from '$lib/utils/sdk/caller/caller';

export default function batchCollect(
  tokenAddresses: string[],
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
) {
  transact(
    dispatch,
    makeTransactPayload({
      before: async () => {
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
        const tx = await populateCallerWriteTx({
          functionName: 'callBatched',
          args: [transactions.map(txToCallerCall)],
        });

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
