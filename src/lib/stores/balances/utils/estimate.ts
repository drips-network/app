import type { Account, AssetConfig } from '$lib/stores/streams/types';
import { bigIntMin } from '$lib/utils/big-int-min-max';

interface Amount {
  amount: bigint;
  tokenAddress: string;
}

export interface StreamEstimation {
  totalStreamed: Amount;
}

export interface AssetConfigEstimation {
  totals: {
    totalStreamed: Amount;
    remainingBalance: Amount;
    amountPerSecond: Amount;
  };
  streams: {
    [streamId: string]: StreamEstimation;
  };
}

export interface AccountEstimation {
  [tokenAddress: string]: AssetConfigEstimation;
}

export function estimateAccount(account: Account): AccountEstimation {
  const returnValue: AccountEstimation = {};

  for (const assetConfig of account.assetConfigs) {
    const estimate = estimateAssetConfig(assetConfig);

    returnValue[assetConfig.tokenAddress] = estimate;
  }

  return returnValue;
}

export function estimateAssetConfig(assetConfig: AssetConfig): AssetConfigEstimation {
  let totalRemaining = BigInt(0);
  let delta = BigInt(0);

  const { streams: configuredStreams } = assetConfig;
  const streamEstimates: { [streamId: string]: bigint } = {};

  const totalStreamed = assetConfig.history.reduce<bigint>((acc, historyItem) => {
    const { timestamp } = historyItem;
    const nextEvent = assetConfig.history[assetConfig.history.indexOf(historyItem) + 1];

    /*
    Any given history event is valid either until the next update's timestamp, or the current date
    if there is none.
    */
    const nextTimestamp = nextEvent?.timestamp ?? new Date();

    const streamedDuringEvent = bigIntMin(
      historyItem.streams.reduce<bigint>((acc, historyItemStream) => {
        // If DripsConfig is undefined, the stream was paused, so nothing was streamed.
        if (!historyItemStream.dripsConfig) {
          return acc;
        }

        // If runsOutOfFunds is undefined, there are either no receivers, or balance is zero.
        if (!historyItem.runsOutOfFunds) {
          return acc;
        }

        /*
        If the startDate of the stream is before the history item's block timestamp, we use the history
        item's timestamp as the valid start date of this particular udpate event. 
        */
        const receiverValidFrom = new Date(
          Math.max(historyItemStream.dripsConfig.startDate?.getTime() || timestamp.getTime()),
        );

        let receiverValidUntil: Date;

        if (historyItemStream.dripsConfig.durationSeconds) {
          receiverValidUntil = new Date(
            Math.min(
              historyItem.runsOutOfFunds.getTime(),
              nextTimestamp.getTime(),
              historyItem.timestamp.getTime() +
                historyItemStream.dripsConfig.durationSeconds * 1000,
            ),
          );
        } else {
          receiverValidUntil = new Date(
            Math.min(historyItem.runsOutOfFunds.getTime(), nextTimestamp.getTime()),
          );
        }

        /*
        Calculcate how many milliseconds the current update has been valid for — either from the beginning
        of its validity to the next update's timestmap, or until the current time if there is none. 
        */
        const historyItemValidForMillis = Math.max(
          receiverValidUntil.getTime() - receiverValidFrom.getTime(),
          0,
        );

        const streamedForReceiver =
          (BigInt(historyItemValidForMillis) *
            (historyItemStream.dripsConfig?.amountPerSecond.amount ?? 0n)) /
          1000n;

        const stream = configuredStreams.find((stream) => stream.id === historyItemStream.streamId);

        /*
        Write an additional per-stream estimate, so we can break down the total streamed per
        stream, in addition to assetConfig level.
        */
        if (stream) {
          streamEstimates[stream.id] =
            (streamEstimates[stream.id] ?? BigInt(0)) + streamedForReceiver;
        }

        return acc + streamedForReceiver;
      }, BigInt(0)),
      historyItem.balance.amount,
    );

    /*
    If there is no next event, calculate the remaining balance of the current asset.
    */
    if (!nextEvent) {
      totalRemaining = historyItem.balance.amount - streamedDuringEvent;
      delta =
        totalRemaining > 0
          ? historyItem.streams.reduce<bigint>(
              (acc, receiver) => acc + (receiver.dripsConfig?.amountPerSecond.amount ?? 0n),
              0n,
            )
          : 0n;
    }

    return acc + streamedDuringEvent;
  }, BigInt(0));

  return {
    totals: {
      totalStreamed: {
        tokenAddress: assetConfig.tokenAddress,
        amount: totalStreamed,
      },
      remainingBalance: {
        tokenAddress: assetConfig.tokenAddress,
        amount: totalRemaining,
      },
      amountPerSecond: {
        amount: delta,
        tokenAddress: assetConfig.tokenAddress,
      },
    },
    streams: Object.fromEntries(
      configuredStreams.map((stream) => [
        stream.id,
        {
          totalStreamed: {
            tokenAddress: assetConfig.tokenAddress,
            amount: streamEstimates[stream.id] ?? BigInt(0),
          },
        },
      ]),
    ),
  };
}
