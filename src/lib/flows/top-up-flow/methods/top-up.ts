import Emoji from '$lib/components/emoji/emoji.svelte';
import type { StepComponentEvents } from '$lib/components/stepper/types';
import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';
import { buildBalanceChangePopulatedTx } from '$lib/utils/streams/streams';
import { MaxUint256 } from 'ethers';
import type { OxString } from '$lib/utils/sdk/sdk-types';
import { getNetworkConfig } from '$lib/utils/sdk/utils/get-network-config';
import { populateErc20WriteTx } from '$lib/utils/sdk/erc20/erc20';

const WAITING_WALLET_ICON = {
  component: Emoji,
  props: {
    emoji: '👛',
    size: 'huge',
  },
};

export default function (
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
  tokenAddress: string,
  amountToTopUp: bigint,
  tokenAllowance: bigint,
) {
  transact(
    dispatch,
    makeTransactPayload({
      before: async () => {
        const { address } = get(walletStore);

        assert(address, 'User is not connected to wallet');
        assert(
          tokenAddress && amountToTopUp && tokenAllowance !== undefined,
          'TriggerTopUpTransaction step is missing required context',
        );

        const needApproval = tokenAllowance < amountToTopUp;

        const setStreamsPopulatedTx = await buildBalanceChangePopulatedTx(
          tokenAddress,
          amountToTopUp,
        );

        delete setStreamsPopulatedTx.gasLimit;

        const tokenApprovalTx = await populateErc20WriteTx({
          token: tokenAddress as OxString,
          functionName: 'approve',
          args: [getNetworkConfig().ADDRESS_DRIVER as OxString, MaxUint256],
        });

        return {
          setStreamsPopulatedTx,
          tokenApprovalTx,
          needApproval,
          tokenAddress,
        };
      },

      transactions: ({ setStreamsPopulatedTx, tokenApprovalTx, needApproval }) => [
        ...(needApproval
          ? [
              {
                transaction: tokenApprovalTx,
                waitingSignatureMessage: {
                  message:
                    'Waiting for you to approve access to the ERC-20 token in your wallet...',
                  subtitle: 'You only have to do this once per token.',
                  icon: WAITING_WALLET_ICON,
                },
                applyGasBuffer: false,
              },
            ]
          : []),
        {
          transaction: setStreamsPopulatedTx,
          waitingSignatureMessage: {
            message: 'Waiting for you to approve the top-up transaction in your wallet...',
            icon: WAITING_WALLET_ICON,
          },
          applyGasBuffer: true,
        },
      ],
    }),
  );
}
