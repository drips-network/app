import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import { AddressDriverClient, AddressDriverPresets, Utils } from 'radicle-drips';
import randomBigintUntilUnique from '../random-bigint-until-unique';
import type { LatestVersion } from '@efstajas/versioned-parser/lib/types';
import { addressDriverAccountMetadataParser } from '../metadata/schemas';
import type {
  CurrentStreamsQuery,
  CurrentStreamsQueryVariables,
} from './__generated__/gql.generated';
import makeStreamId from '$lib/stores/streams/methods/make-stream-id';
import { pin } from '../ipfs';
import { getNetworkConfig } from '../get-drips-clients';
import type { Signer } from 'ethers';

const METADATA_PARSER = addressDriverAccountMetadataParser;
const { ADDRESS_DRIVER: ADDRESS_DRIVER_ADDRESS } = getNetworkConfig();
const USER_METADATA_KEY = 'ipfs';

export async function buildStreamCreateBatchTx(
  addressDriverClient: AddressDriverClient,
  signer: Signer,
  streamOptions: {
    tokenAddress: string;
    amountPerSecond: bigint;
    recipientAccountId: string;
    name: string | undefined;
    startAt?: Date;
    durationSeconds?: number;
  },
) {
  const ownAccountId = await addressDriverClient.getAccountId();

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
      userAccountId: ownAccountId,
    },
  );

  const currentReceivers = currentStreamsQueryRes.userById.streams.outgoing
    .filter(
      (stream) =>
        stream.config.amountPerSecond.tokenAddress.toLowerCase() ===
        streamOptions.tokenAddress.toLowerCase(),
    )
    .map((stream) => ({
      accountId: stream.receiver.account.accountId,
      config: stream.config.raw,
    }));

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

  const currentStreamsByTokenAddress = currentStreamsQueryRes.userById.streams.outgoing.reduce<
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

  const streamsByTokenAddress = {
    ...currentStreamsByTokenAddress,
    [streamOptions.tokenAddress.toLowerCase()]: [
      ...(currentStreamsByTokenAddress[streamOptions.tokenAddress.toLowerCase()] ?? []),
      {
        id: makeStreamId(ownAccountId, streamOptions.tokenAddress, newStreamDripId.toString()),
        name: streamOptions.name,
        config: {
          raw: newStreamConfig.toString(),
          dripId: newStreamDripId.toString(),
          amountPerSecond: {
            amount: streamOptions.amountPerSecond.toString(),
          },
          durationSeconds: streamOptions.durationSeconds,
          startDate: streamOptions.startAt?.toISOString() ?? new Date().toISOString(),
        },
        receiver: {
          account: {
            accountId: streamOptions.recipientAccountId,
          },
        },
      },
    ],
  };

  // Parsing with the latest parser version to ensure we never write any invalid metadata.
  const newMetadata: LatestVersion<typeof addressDriverAccountMetadataParser> =
    METADATA_PARSER.parseLatest({
      describes: {
        driver: 'address',
        accountId: ownAccountId,
      },
      assetConfigs: Object.entries(streamsByTokenAddress).map(([tokenAddress, streams]) => {
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
      writtenByAddress: AddressDriverClient.getUserAddress(ownAccountId),
    });

  const newHash = await pin(newMetadata);

  return AddressDriverPresets.Presets.createNewStreamFlow({
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
  });
}
