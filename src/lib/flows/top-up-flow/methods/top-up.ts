import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';
import { buildBalanceChangePopulatedTx } from '$lib/utils/streams/streams';
import { MaxUint256 } from 'ethers';
import type { OxString } from '$lib/utils/sdk/sdk-types';
import { populateErc20WriteTx } from '$lib/utils/sdk/erc20/erc20';
import { getNetworkConfig } from '$lib/utils/sdk/utils/get-network-config';
import tokensStore from '$lib/stores/tokens/tokens.store';
import unreachable from '$lib/utils/unreachable';
import EmojiAndToken from '$lib/components/emoji-and-token/emoji-and-token.svelte';

export default function (
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
  tokenAddress: string,
  amountToTopUp: bigint,
  tokenAllowance: bigint,
) {
  const tokenInfo = tokensStore.getByAddress(tokenAddress)?.info || unreachable();

  dispatch(
    'transact',
    makeTransactPayload({
      icon: {
        component: EmojiAndToken,
        props: {
          emoji: '💰',
          tokenAddress: tokenInfo.address,
          animateTokenOnMount: true,
        },
      },
      headline: `Add ${tokenInfo?.symbol}`,
      description: `Add funds to your Drips account’s outgoing balance`,
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

        const approvePopulatedTx = await populateErc20WriteTx({
          token: tokenAddress as OxString,
          functionName: 'approve',
          args: [getNetworkConfig().ADDRESS_DRIVER as OxString, MaxUint256],
        });

        return {
          setStreamsPopulatedTx,
          approvePopulatedTx,
          needApproval,
          tokenAddress,
        };
      },

      transactions: ({ setStreamsPopulatedTx, approvePopulatedTx, needApproval }) => [
        ...(needApproval
          ? [
              {
                transaction: approvePopulatedTx,
                title: `Approve Drips to withdraw ${tokenInfo.symbol}`,
                applyGasBuffer: false,
              },
            ]
          : []),
        {
          transaction: setStreamsPopulatedTx,
          title: `Top up ${tokenInfo.symbol}`,
          applyGasBuffer: true,
        },
      ],
    }),
  );
}
