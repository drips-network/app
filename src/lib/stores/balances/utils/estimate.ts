import type {
  Account,
  AssetConfig,
  AssetConfigHistoryItem,
  Receiver,
  StreamId,
} from '$lib/stores/streams/types';
import { unwrapIdItems } from '$lib/utils/wrap-unwrap-id-item';

type Millis = number;

export interface AssetConfigEstimates {
  total: AssetConfigEstimate;
  currentCycle: AssetConfigEstimate;
}

export interface AssetConfigEstimate {
  streams: StreamEstimate[];
  totals: {
    totalStreamed: bigint;
    remainingBalance: bigint;
    totalAmountPerSecond: bigint;
  };
}

interface Cycle {
  start: Date;
  duration: Millis;
}

type AccountEstimate = { [tokenAddress: string]: AssetConfigEstimates };

export function estimateAccount(account: Account, currentCycle: Cycle): AccountEstimate {
  return Object.fromEntries(
    account.assetConfigs.map((assetConfig) => [
      assetConfig.tokenAddress,
      buildAssetConfigEstimates(assetConfig, currentCycle),
    ]),
  );
}

function buildAssetConfigEstimates(
  assetConfig: AssetConfig,
  currentCycle: Cycle,
): AssetConfigEstimates {
  /*
    TODO: Avoid processing the current cycle twice by bounding totalEstimate to before the current cycle,
    and adding the estimates up.
  */
  const totalEstimate = estimateAssetConfig(assetConfig, { from: 0, to: Number.MAX_SAFE_INTEGER });
  const currentCycleEstimate = estimateAssetConfig(assetConfig, {
    from: currentCycle.start.getTime(),
    to: currentCycle.start.getTime() + currentCycle.duration,
  });

  return {
    total: totalEstimate,
    currentCycle: currentCycleEstimate,
  };
}

function estimateAssetConfig(assetConfig: AssetConfig, window: TimeWindow): AssetConfigEstimate {
  const historyItemEstimates = assetConfig.history.map((historyItem, index, historyItems) => {
    const nextHistoryItem = historyItems[index + 1];

    return estimateHistoryItem(historyItem, nextHistoryItem, window);
  });

  const streamTotals = historyItemEstimates.reduce<{ [stream: StreamId]: StreamEstimate }>(
    (acc, historyItemEstimate) => {
      const { streams } = historyItemEstimate;

      for (const stream of streams) {
        const currentVal = acc[stream.id];

        acc[stream.id] = {
          ...acc[stream.id],
          totalStreamed: (currentVal?.totalStreamed ?? 0n) + stream.totalStreamed,
          currentAmountPerSecond: stream.currentAmountPerSecond,
        };
      }

      return acc;
    },
    {},
  );

  const streams = unwrapIdItems(streamTotals);

  const totalStreamed = sumEstimates('totalStreamed', streams);
  const totalAmountPerSecond = sumEstimates('currentAmountPerSecond', streams);
  const { remainingBalance } = historyItemEstimates[historyItemEstimates.length - 1].totals;

  return {
    streams,
    totals: {
      totalStreamed,
      totalAmountPerSecond,
      remainingBalance,
    },
  };
}

export interface StreamEstimate {
  id: StreamId;
  totalStreamed: bigint;
  currentAmountPerSecond: bigint;
  runsOutOfFunds?: Date;
}

interface TimeWindow {
  from: Millis;
  to: Millis;
}

function estimateHistoryItem(
  historyItem: AssetConfigHistoryItem,
  nextHistoryItem: AssetConfigHistoryItem,
  window: TimeWindow,
): AssetConfigEstimate {
  const streamEstimates = historyItem.streams.map((receiver) => {
    const estimate = streamedByStream(window, receiver, historyItem, nextHistoryItem);

    return {
      id: receiver.streamId,
      totalStreamed: estimate.streamed,
      currentAmountPerSecond: estimate.currentAmountPerSecond,
    };
  });

  const totalStreamed = sumEstimates('totalStreamed', streamEstimates);
  const totalAmountPerSecond = sumEstimates('currentAmountPerSecond', streamEstimates);
  const remainingBalance = historyItem.balance.amount - totalStreamed;

  return {
    streams: streamEstimates,
    totals: {
      totalStreamed,
      remainingBalance,
      totalAmountPerSecond,
    },
  };
}

function streamedByStream(
  window: TimeWindow,
  receiver: Receiver,
  historyItem: AssetConfigHistoryItem,
  nextHistoryItem?: AssetConfigHistoryItem,
): {
  streamed: bigint;
  currentAmountPerSecond: bigint;
} {
  // Undefined dripsConfig means the stream was paused.
  if (!receiver.dripsConfig) {
    return {
      streamed: 0n,
      currentAmountPerSecond: 0n,
    };
  }

  const { timestamp: nextTimestampDate } = nextHistoryItem ?? {};
  const nextTimestamp: Millis = nextTimestampDate
    ? nextTimestampDate.getTime()
    : new Date().getTime();

  const { runsOutOfFunds: runsOutOfFundsTimestamp, timestamp: timestampDate } = historyItem;
  const runsOutOfFunds: Millis | undefined = runsOutOfFundsTimestamp
    ? runsOutOfFundsTimestamp.getTime()
    : undefined;
  const timestamp: Millis = timestampDate.getTime();

  const { durationSeconds, amountPerSecond, startDate } = receiver.dripsConfig;

  const duration: Millis | undefined = durationSeconds ? durationSeconds * 1000 : undefined;
  const start: Millis = startDate ? startDate.getTime() : timestamp;

  const streamingFrom = minMax('max', timestamp, start, window.from);
  const scheduledToEndAt = calcScheduledEnd(streamingFrom, start, duration);
  const streamingUntil = minMax('min', runsOutOfFunds, scheduledToEndAt, nextTimestamp, window.to);
  const validForMillis = minMax('max', streamingUntil - streamingFrom, 0);

  const streamed = (BigInt(validForMillis) * amountPerSecond.amount) / 1000n;
  const currentAmountPerSecond =
    streamingUntil >= nextTimestamp && streamingFrom < nextTimestamp ? amountPerSecond.amount : 0n;

  return {
    streamed,
    currentAmountPerSecond,
  };
}

function sumEstimates(
  mode: 'totalStreamed' | 'currentAmountPerSecond',
  streamEstimates: StreamEstimate[],
): bigint {
  const res = streamEstimates.reduce<bigint>(
    (acc, streamEstimate) => acc + streamEstimate[mode],
    0n,
  );
  return res;
}

function calcScheduledEnd(
  timestamp: Millis,
  start?: Millis,
  duration?: Millis,
): Millis | undefined {
  return duration ? (start ?? timestamp) + duration : undefined;
}

function minMax(mode: 'min' | 'max', ...args: (number | undefined)[]) {
  const filtered: number[] = args.filter((a): a is number => a !== undefined);

  return Math[mode](...filtered);
}
