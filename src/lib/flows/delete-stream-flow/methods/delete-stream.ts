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
import MetadataManagerFactory from '$lib/metadata/MetadataManagerFactory';
import AddressDriverMetadataManager from '$lib/metadata/AddressDriverMetadataManager';

export default function (
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
  stream: Stream,
) {
  transact(
    dispatch,
    makeTransactPayload({
      before: async () => {
        const callerClient = await getCallerClient();

        const { userId, address } = stream.sender;
        const { tokenAddress } = stream.dripsConfig.amountPerSecond;

        const { signer } = get(walletStore);
        assert(signer);

        const assetConfig = streams.getAssetConfig(userId, tokenAddress);
        assert(assetConfig, "App hasn't yet fetched the right asset config for this stream");

        const ownAccount = get(streams).accounts[userId];
        assert(assetConfig, "App hasn't yet fetched user's own account");

        const metadataManager = MetadataManagerFactory.getAddressDriverMetadataManager();

        const metadata = metadataManager.generateAccountMetadata(ownAccount, address);
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

        const newHash = await metadataManager.pinAccountMetadata(metadata);

        const currentReceivers = mapFilterUndefined(assetConfig.streams, (stream) =>
          stream.paused
            ? undefined
            : {
                userId: stream.receiver.userId,
                config: stream.dripsConfig.raw,
              },
        );

        const newReceivers = currentReceivers.filter(
          (r) =>
            Utils.DripsReceiverConfiguration.fromUint256(r.config).dripId.toString() !==
            stream.dripsConfig.dripId,
        );

        const { ADDRESS_DRIVER } = getNetworkConfig();

        const createStreamBatchPreset = await AddressDriverPresets.Presets.createNewStreamFlow({
          signer,
          driverAddress: ADDRESS_DRIVER,
          tokenAddress,
          currentReceivers,
          newReceivers,
          userMetadata: [
            {
              key: AddressDriverMetadataManager.USER_METADATA_KEY,
              value: newHash,
            },
          ],
          balanceDelta: 0,
          transferToAddress: address,
        });

        return {
          callerClient,
          createStreamBatchPreset,
          userId,
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
            get(streams).accounts[transactContext.userId].lastIpfsHash === transactContext.newHash,
          5000,
          1000,
        );

        goto('/app/streams');
      },
    }),
  );
}
