import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';
import Emoji from '$lib/components/emoji/emoji.svelte';
import getOwnAccountId from '$lib/utils/sdk/utils/get-own-account-id';
import txToCallerCall from '$lib/utils/sdk/utils/tx-to-caller-call';
import {
  CallerERC2771Domain,
  CallSignedERC2771Types,
  getCallerNonce,
  populateCallerWriteTx,
} from '$lib/utils/sdk/caller/caller';
import populateCreateCollectFlowTxs from '$lib/utils/sdk/address-driver/populate-create-collect-flow-txs';
import type { OxString } from '$lib/utils/sdk/sdk-types';
import gaslessStore from '$lib/stores/gasless/gasless.store';

export default function batchCollect(
  tokenAddresses: string[],
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
  shouldAutoUnwrap: boolean,
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
        const ownAccountId = await getOwnAccountId();
        const { address: userAddress, signer } = get(walletStore);

        assert(userAddress && signer);

        const flowsPromises: ReturnType<typeof populateCreateCollectFlowTxs>[] = [];
        for (const tokenAddress of tokenAddresses) {
          const flow = populateCreateCollectFlowTxs(
            {
              tokenAddress: tokenAddress as OxString,
              maxCycles: 1000,
              currentReceivers: [],
              transferToAddress: userAddress as OxString,
              accountId: ownAccountId,
            },
            false,
            false,
            shouldAutoUnwrap,
          );

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
          address: userAddress,
          accountId: ownAccountId,
        };
      },

      transactions: ({ tx, address }) => [
        {
          transaction: tx,
          applyGasBuffer: true,

          gasless: get(gaslessStore)
            ? {
                nonceGetter: () => getCallerNonce(address),
                ERC2771Data: (nonce) => ({
                  domain: CallerERC2771Domain,
                  types: CallSignedERC2771Types,
                  payload: {
                    sender: address,
                    target: tx.to,
                    data: tx.data,
                    value: '0',
                    nonce,
                    deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour
                  },
                }),
              }
            : undefined,

          title: 'Collect funds',
        },
      ],
    }),
  );
}
