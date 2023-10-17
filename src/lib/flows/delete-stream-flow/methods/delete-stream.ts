import streams from '$lib/stores/streams';
import type { Stream } from '$lib/stores/streams/types';
import { getCallerClient, getNetworkConfig } from '$lib/utils/get-drips-clients';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { get } from 'svelte/store';
import { AddressDriverPresets, Utils } from 'radicle-drips';
import assert from '$lib/utils/assert';
import type { StepComponentEvents } from '$lib/components/stepper/types';
import expect from '$lib/utils/expect';
import { goto } from '$app/navigation';
import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
import type { createEventDispatcher } from 'svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import AddressDriverMetadataManager from '$lib/utils/metadata/AddressDriverMetadataManager';
import MetadataManagerBase from '$lib/utils/metadata/MetadataManagerBase';

export default function (
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
  stream: Stream,
) {
  transact(
    dispatch,
    makeTransactPayload({
      before: async () => {
        const callerClient = await getCallerClient();

        const { accountId, address } = stream.sender;
        const { tokenAddress } = stream.streamConfig.amountPerSecond;

        const { signer } = get(walletStore);
        assert(signer);

        const assetConfig = streams.getAssetConfig(accountId, tokenAddress);
        assert(assetConfig, 'App hasnʼt yet fetched the right asset config for this stream');

        const ownAccount = get(streams).accounts[accountId];
        assert(assetConfig, "App hasnʼt yet fetched user's own account");

        const metadataMgr = new AddressDriverMetadataManager();
        const metadata = metadataMgr.buildAccountMetadata({ forAccount: ownAccount, address });

        // If the stream isn't managed, it didn't have any metadata, so we don't need to make any changes to it.
        if (stream.managed) {
          const assetConfigIndex = metadata.assetConfigs.findIndex(
            (mac) => mac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
          );
          const streamIndex = metadata.assetConfigs[assetConfigIndex].streams.findIndex(
            (ms) => ms.id === stream.id,
          );

          metadata.assetConfigs[assetConfigIndex].streams.splice(streamIndex, 1);

          if (metadata.assetConfigs[assetConfigIndex].streams.length === 0) {
            metadata.assetConfigs.splice(assetConfigIndex, 1);
          }
        }

        const newHash = await metadataMgr.pinAccountMetadata(metadata);

        const currentReceivers = mapFilterUndefined(assetConfig.streams, (stream) =>
          stream.paused
            ? undefined
            : {
                accountId: stream.receiver.accountId,
                config: stream.streamConfig.raw,
              },
        );

        const newReceivers = currentReceivers.filter(
          (r) =>
            Utils.StreamConfiguration.fromUint256(r.config).dripId.toString() !==
            stream.streamConfig.dripId,
        );

        const { ADDRESS_DRIVER } = getNetworkConfig();

        /*
        Pretty confusing that this is a "createStream" preset, but all it is does is 1) call setStreams, and
        2) update metadata. Since we need to do exactly this also for deleting streams, we can use it here.
        */
        const createStreamBatchPreset = await AddressDriverPresets.Presets.createNewStreamFlow({
          signer,
          driverAddress: ADDRESS_DRIVER,
          tokenAddress,
          currentReceivers,
          newReceivers,
          accountMetadata: [
            {
              key: MetadataManagerBase.USER_METADATA_KEY,
              value: newHash,
            },
          ],
          balanceDelta: 0,
          transferToAddress: address,
        });

        return {
          callerClient,
          createStreamBatchPreset,
          accountId,
          newHash,
        };
      },

      transactions: (transactContext) => ({
        transaction: () =>
          transactContext.callerClient.callBatched(transactContext.createStreamBatchPreset),
      }),

      after: async (_, transactContext) => {
        /*
        We wait up to five seconds for `refreshUserAccount` to update the user's own
        account's `lastIpfsHash` to the new hash we just published.
        */
        await expect(
          streams.refreshUserAccount,
          () =>
            get(streams).accounts[transactContext.accountId].lastIpfsHash ===
            transactContext.newHash,
          5000,
          1000,
        );

        goto('/app/streams');
      },
    }),
  );
}
