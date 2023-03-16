import Emoji from '$lib/components/emoji/emoji.svelte';
import type { StepComponentEvents } from '$lib/components/stepper/types';
import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
import streams from '$lib/stores/streams';
import walletStore from '$lib/stores/wallet/wallet.store';
import expect from '$lib/utils/expect';
import { getAddressDriverClient, getAddressDriverTxFactory } from '$lib/utils/get-drips-clients';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { constants } from 'ethers';
import { ERC20TxFactory } from 'radicle-drips';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';

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
        const client = await getAddressDriverClient();
        const txFactory = await getAddressDriverTxFactory();

        const { address, signer } = get(walletStore);

        assert(address, 'User is not connected to wallet');
        assert(
          tokenAddress && amountToTopUp && tokenAllowance !== undefined,
          'TriggerTopUpTransaction step is missing required context',
        );

        const needApproval = tokenAllowance < amountToTopUp;

        const ownUserId = (await client.getUserId()).toString();
        const ownAccount = get(streams).accounts[ownUserId];
        const assetConfig = ownAccount.assetConfigs.find(
          (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
        );

        const currentReceivers = mapFilterUndefined(assetConfig?.streams || [], (stream) =>
          stream.paused
            ? undefined
            : {
                userId: stream.receiver.userId,
                config: stream.dripsConfig.raw,
              },
        );

        const setDripsPopulatedTx = await txFactory.setDrips(
          tokenAddress,
          currentReceivers,
          amountToTopUp,
          currentReceivers,
          0,
          0,
          address,
          /*
          Dirty hack to disable the SDK's built-in gas estimation, because
          it would fail if there's no token approval yet.

          TODO: Introduce a more graceful method of disabling gas estimation.
          */
          { gasLimit: 1 },
        );

        delete setDripsPopulatedTx.gasLimit;

        const setDripsTx = client.setDrips(
          tokenAddress,
          currentReceivers,
          currentReceivers,
          address,
          amountToTopUp,
        );

        const erc20TxFactory = await ERC20TxFactory.create(signer, tokenAddress);
        const approvePopulatedTx = await erc20TxFactory.approve(
          txFactory.driverAddress,
          constants.MaxUint256,
        );

        return {
          setDripsPopulatedTx,
          setDripsTx,
          approvePopulatedTx,
          needApproval,
          tokenAddress,
        };
      },

      transactions: ({ setDripsTx, setDripsPopulatedTx, approvePopulatedTx, needApproval }) =>
        // If the ERC-20 needs approval, we send a batch TX including the approval TX and setDrips.
        needApproval
          ? [
              {
                transaction: approvePopulatedTx,
                waitingSignatureMessage: {
                  message:
                    'Waiting for you to approve access to the ERC-20 token in your wallet...',
                  subtitle: 'You only have to do this once per token.',
                  icon: WAITING_WALLET_ICON,
                },
              },
              {
                transaction: setDripsPopulatedTx,
                waitingSignatureMessage: {
                  message: 'Waiting for you to approve the top-up transaction in your wallet...',
                  icon: WAITING_WALLET_ICON,
                },
              },
            ]
          : { transaction: () => setDripsTx },

      after: async (receipts, transactContext) => {
        const { provider } = get(walletStore);

        const block = await provider.getBlock(receipts[0].blockNumber);
        const { timestamp: blockTimestamp } = block;

        /*
        We wait up to five seconds for `refreshUserAccount` to include a history item
        matching our transaction's block timestamp, checking once a second. If it doesn't
        after five tries, we move forward anyway, but the user will be made aware that they
        may need to wait for a while for their dashboard to refresh.
        */
        await expect(
          streams.refreshUserAccount,
          (account) =>
            Boolean(
              account.assetConfigs
                .find(
                  (ac) =>
                    ac.tokenAddress.toLowerCase() === transactContext.tokenAddress.toLowerCase(),
                )
                ?.history?.find((hi) => hi.timestamp.getTime() / 1000 === blockTimestamp),
            ),
          5000,
          1000,
        );
      },
    }),
  );
}
