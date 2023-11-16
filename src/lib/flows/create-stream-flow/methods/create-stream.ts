import type { StepComponentEvents } from '$lib/components/stepper/types';
import {
  getAddressDriverClient,
  getCallerClient,
  getNetworkConfig,
} from '$lib/utils/get-drips-clients';
import assert from '$lib/utils/assert';
import type { Account } from '$lib/stores/streams/types';
import type { TokenInfoWrapper } from '$lib/stores/tokens/tokens.store';
import { AddressDriverPresets, Utils } from 'radicle-drips';
import { get } from 'svelte/store';
import wallet from '$lib/stores/wallet/wallet.store';
import makeStreamId, { decodeStreamId } from '$lib/stores/streams/methods/make-stream-id';
import expect from '$lib/utils/expect';
import streams from '$lib/stores/streams';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import randomBigintUntilUnique from '$lib/utils/random-bigint-until-unique';
import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
import type { createEventDispatcher } from 'svelte';
import AddressDriverMetadataManager from '$lib/utils/metadata/AddressDriverMetadataManager';
import MetadataManagerBase from '$lib/utils/metadata/MetadataManagerBase';
import type { addressDriverAccountMetadataParser } from '$lib/utils/metadata/schemas';
import { utils } from 'ethers';

export default function (
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
  selectedToken: TokenInfoWrapper,
  amountPerSecond: bigint,
  recipient: string,
  streamName: string | undefined,
  ownAccount: Account,
  schedule?: {
    start: Date;
    end: Date;
  },
) {
  transact(
    dispatch,
    makeTransactPayload({
      before: async () => {
        const callerClient = await getCallerClient();
        const addressDriverClient = await getAddressDriverClient();
        const ownAccountId = (await addressDriverClient.getAccountId()).toString();

        const { address: tokenAddress } = selectedToken.info;

        const assetConfig = ownAccount.assetConfigs.find(
          (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
        );
        assert(assetConfig, 'App hasnʼt yet fetched the right asset config');

        const currentReceivers = mapFilterUndefined(assetConfig.streams, (stream) =>
          stream.paused
            ? undefined
            : {
                accountId: stream.receiver.accountId,
                config: stream.streamConfig.raw,
              },
        );

        const start = schedule ? BigInt(schedule.start.getTime() / 1000) : 0n;

        const duration = schedule
          ? BigInt(Math.floor((schedule.end.getTime() - schedule.start.getTime()) / 1000))
          : 0n;

        const dripId = randomBigintUntilUnique(
          assetConfig.streams.map((s) => BigInt(decodeStreamId(s.id).dripId)),
          4,
        );

        const dripConfig = Utils.StreamConfiguration.toUint256({
          dripId,
          start,
          duration,
          amountPerSec: amountPerSecond,
        });

        const recipientAccountId = utils.isAddress(recipient)
          ? await addressDriverClient.getAccountIdByAddress(recipient)
          : recipient;

        const { address, signer } = get(wallet);
        assert(address);

        const metadataMgr = new AddressDriverMetadataManager();

        const newStreamMetadata: ReturnType<
          typeof addressDriverAccountMetadataParser.parseLatest
        >['assetConfigs'][number]['streams'][number] = {
          id: makeStreamId(ownAccountId, tokenAddress, dripId.toString()),
          initialDripsConfig: {
            dripId: dripId.toString(),
            raw: dripConfig.toString(),
            startTimestamp: Number(start),
            durationSeconds: Number(duration),
            amountPerSecond,
          },
          receiver: {
            accountId: recipientAccountId.toString(),
            driver: 'address',
          },
          archived: false,
          name: streamName ?? 'Unnamed stream',
        };

        const accountMetadata = metadataMgr.buildAccountMetadata({
          forAccount: ownAccount,
          address,
        });
        const currentAssetConfigIndex = accountMetadata.assetConfigs.findIndex(
          (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
        );

        if (currentAssetConfigIndex === -1) {
          accountMetadata.assetConfigs.push({
            tokenAddress,
            streams: [newStreamMetadata],
          });
        } else {
          const current = accountMetadata.assetConfigs[currentAssetConfigIndex];
          accountMetadata.assetConfigs[currentAssetConfigIndex] = {
            ...current,
            streams: [...current.streams, newStreamMetadata],
          };
        }

        const newHash = await metadataMgr.pinAccountMetadata(accountMetadata);

        const { ADDRESS_DRIVER } = getNetworkConfig();

        const createStreamBatchPreset = await AddressDriverPresets.Presets.createNewStreamFlow({
          signer,
          driverAddress: ADDRESS_DRIVER,
          tokenAddress,
          currentReceivers,
          newReceivers: [
            ...currentReceivers,
            {
              config: dripConfig,
              accountId: recipientAccountId,
            },
          ],
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
          createStreamBatchPreset,
          callerClient,
          ownAccountId,
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
            get(streams).accounts[transactContext.ownAccountId].lastIpfsHash ===
            transactContext.newHash,
          5000,
          1000,
        );
      },
    }),
  );
}
