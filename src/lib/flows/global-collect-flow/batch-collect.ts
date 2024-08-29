import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
import walletStore from '$lib/stores/wallet/wallet.store';
import {
  getAddressDriverClient,
  getCallerClient,
  getNetworkConfig,
} from '$lib/utils/get-drips-clients';
import { AddressDriverPresets } from 'radicle-drips';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';
import Emoji from '$lib/components/emoji/emoji.svelte';

export default function batchCollect(
  tokenAddresses: string[],
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
) {
  dispatch(
    'transact',
    makeTransactPayload({
      headline: 'Collect Funds',
      icon: {
        component: Emoji,
        props: {
          emoji: '🫗',
          size: 'huge',
        },
      },
      before: async () => {
        const callerClient = await getCallerClient();
        const addressDriverClient = await getAddressDriverClient();
        const accountId = await addressDriverClient.getAccountId();
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
            accountId,
          });

          flowsPromises.push(flow);
        }

        const flows = await Promise.all(flowsPromises);
        const transactions = flows.flat();
        const tx = await callerClient.populateCallBatchedTx(transactions);

        return {
          tx,
          accountId,
        };
      },

      transactions: ({ tx }) => [
        {
          transaction: tx,
          applyGasBuffer: true,
          title: 'Collecting funds',
        },
      ],
    }),
  );
}
