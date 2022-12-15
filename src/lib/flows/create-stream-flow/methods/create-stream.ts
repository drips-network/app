import type { UpdateAwaitStepFn } from '$lib/components/stepper/types';
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
import wallet from '$lib/stores/wallet';
import makeStreamId, { decodeStreamId } from '$lib/stores/streams/methods/make-stream-id';
import {
  generateMetadata,
  pinAccountMetadata,
  USER_DATA_KEY,
  type streamMetadataSchema,
} from '$lib/stores/streams/metadata';
import type { z } from 'zod';
import Emoji from '$lib/components/emoji/emoji.svelte';
import etherscanLink from '$lib/utils/etherscan-link';
import expect from '$lib/utils/expect';
import streams from '$lib/stores/streams';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { formatBytes32String, toUtf8Bytes } from 'ethers/lib/utils';
import randomBigintUntilUnique from '$lib/utils/random-bigint-until-unique';

export default async (
  updateAwaitStep: UpdateAwaitStepFn,
  selectedToken: TokenInfoWrapper,
  amountPerSecond: bigint,
  recipientAddress: string,
  streamName: string,
  ownAccount: Account,
  schedule?: {
    start: Date;
    end: Date;
  },
) => {
  const callerClient = await getCallerClient();
  const addressDriverClient = await getAddressDriverClient();
  const ownUserId = (await addressDriverClient.getUserId()).toString();

  const { address: tokenAddress } = selectedToken.info;

  const assetConfig = ownAccount.assetConfigs.find((ac) => ac.tokenAddress === tokenAddress);
  assert(assetConfig, "App hasn't yet fetched the right asset config");

  const currentReceivers = mapFilterUndefined(assetConfig.streams, (stream) =>
    stream.paused
      ? undefined
      : {
          userId: stream.receiver.userId,
          config: stream.dripsConfig.raw,
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

  const dripConfig = Utils.DripsReceiverConfiguration.toUint256({
    dripId,
    start,
    duration,
    amountPerSec: amountPerSecond,
  });

  const recipientUserId = await addressDriverClient.getUserIdByAddress(recipientAddress);
  const { address } = get(wallet);
  assert(address);

  const newStreamMetadata: z.infer<typeof streamMetadataSchema> = {
    id: makeStreamId(ownUserId, tokenAddress, dripId.toString()),
    initialDripsConfig: {
      dripId: dripId.toString(),
      raw: dripConfig.toString(),
      startTimestamp: Number(start),
      durationSeconds: Number(duration),
      amountPerSecond,
    },
    receiver: {
      userId: recipientUserId.toString(),
      driver: 'address',
    },
    archived: false,
    name: streamName,
  };

  const accountMetadata = generateMetadata(ownAccount, address);
  const currentAssetConfigIndex = accountMetadata.assetConfigs.findIndex(
    (ac) => ac.tokenAddress === tokenAddress,
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

  const newHash = await pinAccountMetadata(accountMetadata);

  const { CONTRACT_ADDRESS_DRIVER } = getNetworkConfig();

  const createStreamBatchPreset = AddressDriverPresets.Presets.createNewStreamFlow({
    driverAddress: CONTRACT_ADDRESS_DRIVER,
    tokenAddress,
    currentReceivers,
    newReceivers: [
      ...currentReceivers,
      {
        config: dripConfig,
        userId: recipientUserId,
      },
    ],
    userMetadata: [
      {
        key: formatBytes32String(USER_DATA_KEY),
        value: toUtf8Bytes(newHash),
      },
    ],
    balanceDelta: 0,
    transferToAddress: address,
  });

  const waitingWalletIcon = {
    component: Emoji,
    props: {
      emoji: '👛',
      size: 'huge',
    },
  };

  updateAwaitStep({
    icon: waitingWalletIcon,
    message: 'Waiting for you to confirm the transaction in your wallet...',
  });

  const tx = await callerClient.callBatched(createStreamBatchPreset);

  updateAwaitStep({
    message: 'Waiting for your transaction to be confirmed…',
    link: {
      label: 'View on Etherscan',
      url: etherscanLink(get(wallet).network.name, tx.hash),
    },
  });

  await tx.wait();

  updateAwaitStep({
    message: 'Wrapping up…',
  });

  /*
  We wait up to five seconds for `refreshUserAccount` to update the user's own
  account's `lastIpfsHash` to the new hash we just published.
  */
  await expect(
    streams.refreshUserAccount,
    () => get(streams).accounts[ownUserId].lastIpfsHash === newHash,
    5000,
    1000,
  );
};
