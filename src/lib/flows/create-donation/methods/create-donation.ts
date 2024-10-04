import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';
import { MaxUint256, toBigInt } from 'ethers';
import type { OxString } from '$lib/utils/sdk/sdk-types';
import { populateErc20WriteTx } from '$lib/utils/sdk/erc20/erc20';
import { populateAddressDriverWriteTx } from '$lib/utils/sdk/address-driver/address-driver';
import network from '$lib/stores/wallet/network';

export default function (
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
  recipientAccountId: string,
  tokenAddress: string,
  amountToGive: bigint,
  tokenAllowance: bigint,
) {
  dispatch(
    'transact',
    makeTransactPayload({
      headline: 'Donate Instantly',
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
          args: [network.contracts.ADDRESS_DRIVER as OxString, MaxUint256],
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
                applyGasBuffer: false,
                title: `Approve Drips to withdraw the ERC-20`,
              },
            ]
          : []),

        {
          transaction: givePopulatedTx,
          applyGasBuffer: false,
          title: 'Make the one-time donation',
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
