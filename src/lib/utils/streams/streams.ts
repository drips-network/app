import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import { AddressDriverPresets, Utils } from 'radicle-drips';
import randomBigintUntilUnique from '../random-bigint-until-unique';
import { addressDriverAccountMetadataParser } from '../metadata/schemas';
import type {
  CurrentStreamsQuery,
  CurrentStreamsQueryVariables,
} from './__generated__/gql.generated';
import { pin } from '../ipfs';
import { getNetworkConfig } from '../sdk/utils/get-network-config';
import { toBigInt, type ContractTransaction, type Signer } from 'ethers';
import unreachable from '../unreachable';
import assert from '$lib/utils/assert';
import makeStreamId, { decodeStreamId } from './make-stream-id';
import extractAddressFromAccountId from '../sdk/utils/extract-address-from-accountId';
import getOwnAccountId from '../sdk/utils/get-own-account-id';
import { populateAddressDriverWriteTx } from '../sdk/address-driver/address-driver';
import keyValueToMetatada from '../sdk/utils/key-value-to-metadata';
import type { OxString } from '../sdk/sdk-types';
import { formatStreamReceivers } from '../sdk/utils/format-stream-receivers';

type NewStreamOptions = {
  tokenAddress: string;
  amountPerSecond: bigint;
  recipientAccountId: string;
  name: string | undefined;
  startAt?: Date;
  durationSeconds?: number;
};

const METADATA_PARSER = addressDriverAccountMetadataParser;
const { ADDRESS_DRIVER: ADDRESS_DRIVER_ADDRESS } = getNetworkConfig();
const USER_METADATA_KEY = 'ipfs';

export async function _getCurrentStreamsAndReceivers(accountId: string, tokenAddress: string) {
  const currentStreamsQueryRes = await query<CurrentStreamsQuery, CurrentStreamsQueryVariables>(
    gql`
      query CurrentStreams($userAccountId: ID!) {
        userById(accountId: $userAccountId) {
          streams {
            outgoing {
              id
              name
              isPaused
              config {
                raw
                amountPerSecond {
                  tokenAddress
                }
                dripId
                amountPerSecond {
                  amount
                }
                durationSeconds
                startDate
              }
              receiver {
                ... on User {
                  account {
                    accountId
                  }
                }
                ... on DripList {
                  account {
                    accountId
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      userAccountId: accountId,
    },
  );

  const { outgoing: currentStreams } = currentStreamsQueryRes.userById.streams;

  const currentReceivers = currentStreams
    .filter(
      (stream) =>
        stream.config.amountPerSecond.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
    )
    .filter((stream) => !stream.isPaused)
    .map((stream) => ({
      accountId: stream.receiver.account.accountId,
      config: stream.config.raw,
    }));

  return {
    currentStreams,
    currentReceivers: currentReceivers.map((r) => ({
      accountId: toBigInt(r.accountId),
      config: toBigInt(r.config),
    })),
  };
}

function _buildMetadata(
  streams: CurrentStreamsQuery['userById']['streams']['outgoing'],
  accountId: string,
  newStream?: NewStreamOptions & { dripId: bigint },
) {
  const streamsByTokenAddress = streams.reduce<
    Record<string, CurrentStreamsQuery['userById']['streams']['outgoing'][number][]>
  >(
    (acc, stream) => ({
      ...acc,
      [stream.config.amountPerSecond.tokenAddress.toLowerCase()]: [
        ...(acc[stream.config.amountPerSecond.tokenAddress.toLowerCase()] ?? []),
        stream,
      ],
    }),
    {},
  );

  const newStreamsByTokenAddress = newStream
    ? {
        ...streamsByTokenAddress,
        [newStream.tokenAddress.toLowerCase()]: [
          ...(streamsByTokenAddress[newStream.tokenAddress.toLowerCase()] ?? []),
          {
            id: makeStreamId(accountId, newStream.tokenAddress, newStream.dripId.toString()),
            name: newStream.name,
            config: {
              raw: Utils.StreamConfiguration.toUint256({
                dripId: newStream.dripId,
                start: BigInt(newStream.startAt?.getTime() ?? 0) / 1000n,
                duration: BigInt(newStream.durationSeconds ?? 0),
                amountPerSec: newStream.amountPerSecond,
              }).toString(),
              dripId: newStream.dripId.toString(),
              amountPerSecond: {
                amount: newStream.amountPerSecond.toString(),
              },
              durationSeconds: newStream.durationSeconds,
              startDate: newStream.startAt?.toISOString() ?? new Date().toISOString(),
            },
            receiver: {
              account: {
                accountId: newStream.recipientAccountId,
              },
            },
          },
        ],
      }
    : streamsByTokenAddress;

  // Parsing with the latest parser version to ensure we never write any invalid metadata.
  return METADATA_PARSER.parseLatest({
    describes: {
      driver: 'address',
      accountId,
    },
    assetConfigs: Object.entries(newStreamsByTokenAddress).map(([tokenAddress, streams]) => {
      return {
        tokenAddress,
        streams: streams.map((stream) => {
          const recipientDriver = Utils.AccountId.getDriver(stream.receiver.account.accountId);

          let supportedDriver: 'address' | 'nft' | 'repo';

          if (['address', 'nft', 'repo'].includes(recipientDriver)) {
            supportedDriver = recipientDriver as 'address' | 'nft' | 'repo';
          } else {
            throw new Error(`Unsupported recipient driver: ${recipientDriver}`);
          }

          return {
            id: stream.id,
            initialDripsConfig: {
              raw: stream.config.raw,
              dripId: stream.config.dripId,
              amountPerSecond: BigInt(stream.config.amountPerSecond.amount),
              durationSeconds: stream.config.durationSeconds || 0,
              startTimestamp: new Date(stream.config.startDate).getTime() / 1000,
            },
            receiver: {
              driver: supportedDriver,
              accountId: stream.receiver.account.accountId,
            },
            archived: false,
            name: stream.name ?? undefined,
          };
        }),
      };
    }),
    timestamp: Math.floor(new Date().getTime() / 1000),
    writtenByAddress: extractAddressFromAccountId(accountId),
  });
}

export async function buildStreamCreateBatchTx(
  signer: Signer,
  streamOptions: NewStreamOptions,
  topUpAmount?: bigint,
) {
  const ownAccountId = await getOwnAccountId();

  const { currentStreams, currentReceivers } = await _getCurrentStreamsAndReceivers(
    ownAccountId,
    streamOptions.tokenAddress,
  );

  const newStreamDripId = randomBigintUntilUnique(
    currentReceivers.map((r) => Utils.StreamConfiguration.fromUint256(r.config).dripId),
    4,
  );

  const {
    startAt: scheduleStartAt,
    durationSeconds: scheduleDurationSeconds,
    amountPerSecond: amountPerSec,
  } = streamOptions;

  const newStreamConfig = Utils.StreamConfiguration.toUint256({
    dripId: newStreamDripId,
    start: BigInt(scheduleStartAt?.getTime() ?? 0) / 1000n,
    duration: BigInt(scheduleDurationSeconds ?? 0),
    amountPerSec,
  });

  const newMetadata = _buildMetadata(currentStreams, ownAccountId, {
    ...streamOptions,
    dripId: newStreamDripId,
  });

  const newHash = await pin(newMetadata);

  return {
    newHash,
    batch: await AddressDriverPresets.Presets.createNewStreamFlow({
      signer,
      driverAddress: ADDRESS_DRIVER_ADDRESS,
      tokenAddress: streamOptions.tokenAddress,
      currentReceivers,
      newReceivers: [
        ...currentReceivers,
        {
          config: newStreamConfig,
          accountId: streamOptions.recipientAccountId,
        },
      ],
      accountMetadata: [
        {
          key: USER_METADATA_KEY,
          value: newHash,
        },
      ],
      balanceDelta: topUpAmount ?? 0,
      transferToAddress: extractAddressFromAccountId(ownAccountId),
    }),
  };
}

export async function buildStreamDeleteBatchTx(signer: Signer, streamId: string) {
  const ownAccountId = await getOwnAccountId();

  const { tokenAddress, dripId } = decodeStreamId(streamId);

  const { currentStreams, currentReceivers } = await _getCurrentStreamsAndReceivers(
    ownAccountId,
    tokenAddress,
  );

  const metadata = _buildMetadata(currentStreams, ownAccountId);

  // Remove the metadata for the stream we're deleting.
  metadata.assetConfigs = metadata.assetConfigs.map((assetConfig) => ({
    ...assetConfig,
    streams: assetConfig.streams.filter((stream) => stream.id !== streamId),
  }));

  const newHash = await pin(metadata);

  const newReceivers = currentReceivers.filter(
    (r) => Utils.StreamConfiguration.fromUint256(r.config).dripId.toString() !== dripId,
  );

  return {
    newHash,
    batch: await AddressDriverPresets.Presets.createNewStreamFlow({
      signer,
      driverAddress: ADDRESS_DRIVER_ADDRESS,
      tokenAddress,
      currentReceivers,
      newReceivers,
      accountMetadata: [
        {
          key: USER_METADATA_KEY,
          value: newHash,
        },
      ],
      balanceDelta: 0,
      transferToAddress: extractAddressFromAccountId(ownAccountId),
    }),
  };
}

export async function buildBalanceChangePopulatedTx(tokenAddress: string, amount: bigint) {
  const ownAccountId = await getOwnAccountId();

  const { currentReceivers } = await _getCurrentStreamsAndReceivers(ownAccountId, tokenAddress);

  return populateAddressDriverWriteTx({
    functionName: 'setStreams',
    args: [
      tokenAddress as OxString,
      formatStreamReceivers(currentReceivers),
      amount,
      formatStreamReceivers(currentReceivers),
      0,
      0,
      extractAddressFromAccountId(ownAccountId),
    ],
  });
}

export async function buildPauseStreamPopulatedTx(streamId: string) {
  const ownAccountId = await getOwnAccountId();

  const { dripId, tokenAddress } = decodeStreamId(streamId);

  const { currentReceivers } = await _getCurrentStreamsAndReceivers(ownAccountId, tokenAddress);

  const newReceivers = currentReceivers.filter((r) => {
    const streamConfig = Utils.StreamConfiguration.fromUint256(r.config);
    return streamConfig.dripId.toString() !== dripId;
  });

  return populateAddressDriverWriteTx({
    functionName: 'setStreams',
    args: [
      tokenAddress as OxString,
      currentReceivers,
      0n,
      newReceivers,
      0,
      0,
      extractAddressFromAccountId(ownAccountId),
    ],
  });
}

export async function buildUnpauseStreamPopulatedTx(streamId: string) {
  const ownAccountId = await getOwnAccountId();

  const { dripId, tokenAddress } = decodeStreamId(streamId);

  const { currentStreams, currentReceivers } = await _getCurrentStreamsAndReceivers(
    ownAccountId,
    tokenAddress,
  );

  const streamToUnpause = currentStreams.find(
    (stream) =>
      stream.config.amountPerSecond.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() &&
      stream.config.dripId === dripId,
  );

  if (!streamToUnpause?.isPaused) {
    throw new Error(`Stream ${streamId} is not paused`);
  }

  const newReceivers = currentReceivers.concat({
    accountId: toBigInt(streamToUnpause.receiver.account.accountId),
    config: toBigInt(streamToUnpause.config.raw),
  });

  return populateAddressDriverWriteTx({
    functionName: 'setStreams',
    args: [
      tokenAddress as OxString,
      currentReceivers,
      0n,
      newReceivers,
      0,
      0,
      extractAddressFromAccountId(ownAccountId),
    ],
  });
}

export async function buildEditStreamBatch(
  streamId: string,
  newData: {
    name?: string;
    amountPerSecond?: bigint;
  },
) {
  const ownAccountId = await getOwnAccountId();

  const { dripId, tokenAddress } = decodeStreamId(streamId);

  const { currentStreams, currentReceivers } = await _getCurrentStreamsAndReceivers(
    ownAccountId,
    tokenAddress,
  );

  const streamToEdit = currentStreams.find((stream) => stream.id === streamId);
  assert(streamToEdit, `Stream ${streamId} not found`);

  const batch: ContractTransaction[] = [];

  let hash: string | undefined;

  if (newData.name) {
    const metadata = _buildMetadata(currentStreams, ownAccountId);

    const assetConfigIndex = metadata.assetConfigs.findIndex(
      (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
    );

    const streamIndex = metadata.assetConfigs[assetConfigIndex]?.streams.findIndex(
      (stream) => stream.id === streamId,
    );

    assert(
      assetConfigIndex !== undefined && streamIndex !== undefined,
      `Stream ${streamId} not found in metadata`,
    );

    metadata.assetConfigs[assetConfigIndex].streams[streamIndex].name = newData.name;

    hash = await pin(metadata);

    batch.push(
      await populateAddressDriverWriteTx({
        functionName: 'emitAccountMetadata',
        args: [[keyValueToMetatada({ key: USER_METADATA_KEY, value: hash })]],
      }),
    );
  }

  if (newData.amountPerSecond) {
    const newReceivers = currentReceivers.map((r) => {
      const streamConfig = Utils.StreamConfiguration.fromUint256(r.config);

      if (streamConfig.dripId.toString() === dripId) {
        return {
          accountId: r.accountId,
          config: Utils.StreamConfiguration.toUint256({
            dripId: streamConfig.dripId,
            start: streamConfig.start,
            duration: streamConfig.duration,
            amountPerSec: newData.amountPerSecond ?? unreachable(),
          }),
        };
      }

      return r;
    });

    batch.push(
      await populateAddressDriverWriteTx({
        functionName: 'setStreams',
        args: [
          tokenAddress as OxString,
          currentReceivers,
          0n,
          newReceivers,
          0,
          0,
          extractAddressFromAccountId(ownAccountId),
        ],
      }),
    );
  }

  return {
    newHash: hash,
    batch,
  };
}
