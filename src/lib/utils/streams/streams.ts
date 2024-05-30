import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import { Utils, type AddressDriverClient, type CallerClient } from 'radicle-drips';
import randomBigintUntilUnique from '../random-bigint-until-unique';
import type { LatestVersion } from '@efstajas/versioned-parser/lib/types';
import type { addressDriverAccountMetadataParser } from '../metadata/schemas';
import type { CurrentStreamsQuery, CurrentStreamsQueryVariables } from './__generated__/gql.generated';

export async function create(
  callerClient: CallerClient,
  addressDriverClient: AddressDriverClient,
  streamOptions: {
    tokenAddress: string;
    amountPerSecond: bigint;
    recipientAccountId: string;
    name: string;
    startAt?: Date;
    durationSeconds?: number;
  },
) {
  const ownAccountId = addressDriverClient.getAccountId().toString();

  const currentStreamsQueryRes = await query<CurrentStreamsQuery, CurrentStreamsQueryVariables>(
    gql`
      query CurrentStreams($userAccountId: ID!) {
        userById(accountId: $userAccountId) {
          streams {
            outgoing {
              name
              config {
                raw
                amountPerSecond {
                  tokenAddress
                }
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

  const currentReceivers = currentStreamsQueryRes.userById.streams.outgoing.map((stream) => ({
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

  const newStreamMetadata: LatestVersion<typeof addressDriverAccountMetadataParser>['assetConfigs'][0]['streams'][0] = {

  };
}
