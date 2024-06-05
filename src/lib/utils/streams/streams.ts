import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import { AddressDriverClient, AddressDriverPresets, Utils } from 'radicle-drips';
import randomBigintUntilUnique from '../random-bigint-until-unique';
import { addressDriverAccountMetadataParser } from '../metadata/schemas';
import type {
  CurrentStreamsQuery,
  CurrentStreamsQueryVariables,
} from './__generated__/gql.generated';
import makeStreamId, { decodeStreamId } from '$lib/stores/streams/methods/make-stream-id';
import { pin } from '../ipfs';
import { getAddressDriverTxFactory, getNetworkConfig } from '../get-drips-clients';
import type { Signer } from 'ethers';

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

async function _getCurrentStreamsAndReceivers(accountId: string, tokenAddress: string) {
  const currentStreamsQueryRes = await query<CurrentStreamsQuery, CurrentStreamsQueryVariables>(
    gql`
      query CurrentStreams($userAccountId: ID!) {
        userById(accountId: $userAccountId) {
          streams {
            outgoing {
              id
              name
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
    .map((stream) => ({
      accountId: stream.receiver.account.accountId,
      config: stream.config.raw,
    }));

  return {
    currentStreams,
    currentReceivers,
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
    writtenByAddress: AddressDriverClient.getUserAddress(accountId),
  });
}

export async function buildStreamCreateBatchTx(
  addressDriverClient: AddressDriverClient,
  signer: Signer,
  streamOptions: NewStreamOptions,
) {
  const ownAccountId = await addressDriverClient.getAccountId();

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
      balanceDelta: 0,
      transferToAddress: AddressDriverClient.getUserAddress(ownAccountId),
    }),
  };
}

export async function buildStreamDeleteBatchTx(
  addressDriverClient: AddressDriverClient,
  signer: Signer,
  streamId: string,
) {
  const ownAccountId = await addressDriverClient.getAccountId();

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
      transferToAddress: AddressDriverClient.getUserAddress(ownAccountId),
    }),
  };
}

export async function buildBalanceChangePopulatedTx(
  addressDriverClient: AddressDriverClient,
  tokenAddress: string,
  amount: bigint,
) {
  const ownAccountId = await addressDriverClient.getAccountId();
  const txFactory = await getAddressDriverTxFactory();

  const { currentReceivers } = await _getCurrentStreamsAndReceivers(ownAccountId, tokenAddress);

  return txFactory.setStreams(
    tokenAddress,
    currentReceivers,
    amount,
    currentReceivers,
    0,
    0,
    AddressDriverClient.getUserAddress(ownAccountId),
    /*
    Dirty hack to disable the SDK's built-in gas estimation, because
    it would fail if there's no token approval yet.

    TODO: Introduce a more graceful method of disabling gas estimation.
    */
    { gasLimit: 1 },
  );
}
