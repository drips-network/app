import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
import walletStore from '$lib/stores/wallet/wallet.store';
import { getAddressDriverTxFactory } from '$lib/utils/get-drips-clients';
import { constants } from 'ethers';
import { ERC20TxFactory } from 'radicle-drips';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';

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
        const txFactory = await getAddressDriverTxFactory();

        const { address, signer } = get(walletStore);

        assert(address, 'User is not connected to wallet');
        assert(
          tokenAddress && amountToGive && tokenAllowance !== undefined,
          'TriggerGiveTransaction step is missing required context',
        );

        const needApproval = tokenAllowance < amountToGive;

        const givePopulatedTx = await txFactory.give(
          recipientAccountId,
          tokenAddress,
          amountToGive,
          /*
          Dirty hack to disable the SDK's built-in gas estimation, because
          it would fail if there's no token approval yet.

          TODO: Introduce a more graceful method of disabling gas estimation.
          */
          { gasLimit: 1 },
        );
        delete givePopulatedTx.gasLimit;

        const erc20TxFactory = await ERC20TxFactory.create(signer, tokenAddress);
        const approvePopulatedTx = await erc20TxFactory.approve(
          txFactory.driverAddress,
          constants.MaxUint256,
        );

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
                title: `Approving access to the ERC-20`,
              },
            ]
          : []),

        {
          transaction: givePopulatedTx,
          applyGasBuffer: false,
          title: 'Approving donation',
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
