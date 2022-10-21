import type { Account, AssetConfig } from '$lib/stores/streams/types';

interface Amount {
  amount: bigint;
  tokenAddress: string;
}

export interface StreamEstimation {
  totalStreamed: Amount;
  amountPerSecond: Amount;
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
  const streamEstimates: { [streamId: string]: StreamEstimation } = {};

  const remainingBalance: Amount = {
    tokenAddress: assetConfig.tokenAddress,
    amount: 0n,
  };

  for (const historyItem of assetConfig.history) {
    const { timestamp } = historyItem;
    const nextEvent = assetConfig.history[assetConfig.history.indexOf(historyItem) + 1];

    /*
    Any given history event is valid either until the next update's timestamp, or the current date
    if there is none.
    */
    const nextTimestamp = nextEvent?.timestamp ?? new Date();

    const streamedDuringEvent: { [streamId: string]: StreamEstimation } = {};

    for (const stream of historyItem.streams) {
      /*
      If DripsConfig is undefined, the stream was paused, so nothing was streamed. We keep the total
      streamed value whatever it was before, update the current amountPerSecond to zero, and move on
      to the next stream.
      */
      if (!stream.dripsConfig) {
        streamedDuringEvent[stream.streamId] = {
          totalStreamed: {
            tokenAddress: assetConfig.tokenAddress,
            amount: streamedDuringEvent[stream.streamId]?.totalStreamed.amount ?? 0n,
          },
          amountPerSecond: {
            tokenAddress: assetConfig.tokenAddress,
            amount: 0n,
          },
        };

        break;
      }

      /*
      If the startDate of the stream is before the history item's block timestamp, we use the history
      item's timestamp as the valid start date of this particular udpate event. 
      */
      const streamingFrom = new Date(
        Math.max(stream.dripsConfig.startDate?.getTime() || timestamp.getTime()),
      );

      /*
      If a duration has been set for the current receiver, calculate the timestamp of when it is set
      to stop. If there is no duration, we use the next event timestamp, because that's the maximum
      of how long the current receiver may be valid for.
      */
      const durationEndDate = stream.dripsConfig.durationSeconds
        ? new Date(streamingFrom.getTime() + stream.dripsConfig.durationSeconds * 1000)
        : nextTimestamp;

      /*
      This runsOutOfFunds date is the time at which the current balance will deplete. It may be undefined if
      all streams have a duration that causes them all to cease before the balance is depleted, or the balance
      is zero. If there is no runsOutOfFunds date, we use the next event timestamp, because that's the maximum
      of how long the current receiver may be valid for.
      */
      const runsOutOfFunds = historyItem.runsOutOfFunds ?? nextTimestamp;

      /*
      This receivers streams until either the end of its duration, when it runs out of funds, or when the next
      update item becomes valid, or until maximum the current timestamp.
      */
      const streamingUntil = new Date(
        Math.min(durationEndDate.getTime(), runsOutOfFunds.getTime(), nextTimestamp.getTime()),
      );

      const historyItemValidForMillis = streamingUntil.getTime() - streamingFrom.getTime();
      const streamedByReceiverDuringEvent =
        (BigInt(historyItemValidForMillis) * stream.dripsConfig.amountPerSecond.amount) / 1000n;

      /*
      If streamingUntil matches the nextTimestamp, we can infer that the stream was ongoing at the end of this
      event's validity (either until the next event occured, or the current time).
      */
      const wasStreamingAtTheEndOfEvent = streamingUntil.getTime() === nextTimestamp.getTime();

      streamedDuringEvent[stream.streamId] = {
        totalStreamed: {
          tokenAddress: assetConfig.tokenAddress,
          amount:
            (streamEstimates[stream.streamId]?.totalStreamed.amount ?? 0n) +
            streamedByReceiverDuringEvent,
        },
        amountPerSecond: {
          tokenAddress: assetConfig.tokenAddress,
          amount: wasStreamingAtTheEndOfEvent ? stream.dripsConfig.amountPerSecond.amount : 0n,
        },
      };
    }

    // Summarize all stream estimates from within this assetConfig history event.
    for (const [streamId, eventStreamEstimate] of Object.entries(streamedDuringEvent)) {
      streamEstimates[streamId] = {
        totalStreamed: {
          tokenAddress: assetConfig.tokenAddress,
          amount:
            (streamEstimates[streamId]?.totalStreamed.amount ?? BigInt(0)) +
            eventStreamEstimate.totalStreamed.amount,
        },
        amountPerSecond: eventStreamEstimate.amountPerSecond,
      };
    }

    const totalStreamedDuringHistoryEvent = Object.values(streamedDuringEvent).reduce<bigint>(
      (acc, estimate) => acc + estimate.totalStreamed.amount,
      0n,
    );

    if (assetConfig.history.indexOf(historyItem) === assetConfig.history.length - 1) {
      remainingBalance.amount = historyItem.balance.amount - totalStreamedDuringHistoryEvent;
    }
  }

  // Calculate the totals for the asset config estimation based on stream-level estimates.
  const totalStreamed = Object.values(streamEstimates).reduce<Amount>(
    (acc, streamEstimate) => ({
      ...acc,
      amount: acc.amount + streamEstimate.totalStreamed.amount,
    }),
    { tokenAddress: assetConfig.tokenAddress, amount: 0n },
  );

  // Calculate the current total amountPerSecond based on stream-level estimates.
  const amountPerSecond = Object.values(streamEstimates).reduce<Amount>(
    (acc, streamEstimate) => ({
      ...acc,
      amount: acc.amount + streamEstimate.amountPerSecond.amount,
    }),
    { tokenAddress: assetConfig.tokenAddress, amount: 0n },
  );

  return {
    totals: {
      totalStreamed,
      remainingBalance,
      amountPerSecond,
    },
    streams: streamEstimates,
  };
}
