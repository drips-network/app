import Emoji from '$lib/components/emoji/emoji.svelte';
import type { StepComponentEvents } from '$lib/components/stepper/types';
import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';
import { MaxUint256, toBigInt } from 'ethers';
import type { OxString } from '$lib/utils/sdk/sdk-types';
import { populateErc20WriteTx } from '$lib/utils/sdk/erc20/erc20';
import { populateAddressDriverWriteTx } from '$lib/utils/sdk/address-driver/address-driver';
import { getNetworkConfig } from '$lib/utils/get-drips-clients';

const WAITING_WALLET_ICON = {
  component: Emoji,
  props: {
    emoji: '👛',
    size: 'huge',
  },
};

export default function (
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
  recipientAccountId: string,
  tokenAddress: string,
  amountToGive: bigint,
  tokenAllowance: bigint,
) {
  transact(
    dispatch,
    makeTransactPayload({
      before: async () => {
        const { address } = get(walletStore);

        assert(address, 'User is not connected to wallet');
        assert(
          tokenAddress && amountToGive && tokenAllowance !== undefined,
          'TriggerGiveTransaction step is missing required context',
        );

        const needApproval = tokenAllowance < amountToGive;

        const givePopulatedTx = await populateAddressDriverWriteTx({
          functionName: 'give',
          args: [toBigInt(recipientAccountId), tokenAddress as OxString, amountToGive],
        });

        const approvePopulatedTx = await populateErc20WriteTx({
          token: tokenAddress as OxString,
          functionName: 'approve',
          args: [getNetworkConfig().ADDRESS_DRIVER as OxString, MaxUint256],
        });

        return {
          givePopulatedTx,
          approvePopulatedTx,
          needApproval,
          tokenAddress,
        };
      },

      transactions: ({ givePopulatedTx, approvePopulatedTx, needApproval }) => [
        ...(needApproval
          ? [
              {
                transaction: approvePopulatedTx,
                waitingSignatureMessage: {
                  message:
                    'Waiting for you to approve Drips access to the ERC-20 token in your wallet...',
                  subtitle: 'You only have to do this once per token.',
                  icon: WAITING_WALLET_ICON,
                },
                applyGasBuffer: false,
              },
            ]
          : []),

        {
          transaction: givePopulatedTx,
          waitingSignatureMessage: {
            message: 'Waiting for you to approve the donation transaction in your wallet...',
            icon: WAITING_WALLET_ICON,
          },
          applyGasBuffer: false,
        },
      ],

      after: async () => {
        /*
        We wait up to five seconds for `refreshUserAccount` to include a history item
        matching our transaction's block timestamp, checking once a second. If it doesnʼt
        after five tries, we move forward anyway, but the user will be made aware that they
        may need to wait for a while for their dashboard to refresh.
        */
        // TODO(streams): poll api here
        // await expect(
        //   streams.refreshUserAccount,
        //   (account) =>
        //     Boolean(
        //       account.assetConfigs
        //         .find(
        //           (ac) =>
        //             ac.tokenAddress.toLowerCase() === transactContext.tokenAddress.toLowerCase(),
        //         )
        //         ?.history?.find((hi) => hi.timestamp.getTime() / 1000 === blockTimestamp),
        //     ),
        //   5000,
        //   1000,
        // );
      },
    }),
  );
}
