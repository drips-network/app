import type {
  Account,
  AddressDriverUser,
  AssetConfig,
  AssetConfigHistoryItem,
  NFTDriverUser,
  Receiver,
  StreamId,
} from '$lib/stores/streams/types';
import { unwrapIdItems } from '$lib/utils/wrap-unwrap-id-item';
import type { SqueezedStreamsEvent } from 'radicle-drips';

type Millis = number;

export interface StreamEstimate {
  id: StreamId;
  totalStreamed: bigint;
  currentAmountPerSecond: bigint;
  runsOutOfFunds?: Date;
  receiver: NFTDriverUser | AddressDriverUser;
  sender: AddressDriverUser;
  tokenAddress: string;
}

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

interface TimeWindow {
  from: Millis;
  to: Millis;
}

type AccountEstimate = { [tokenAddress: string]: AssetConfigEstimates };

export function estimateAccount(
  account: Account,
  currentCycle: Cycle,
  excludingSqueezes: SqueezedStreamsEvent[] = [],
): AccountEstimate {
  return Object.fromEntries(
    account.assetConfigs.map((assetConfig) => [
      assetConfig.tokenAddress.toLowerCase(),
      buildAssetConfigEstimates(assetConfig, currentCycle, account.user, excludingSqueezes),
    ]),
  );
}

function buildAssetConfigEstimates(
  assetConfig: AssetConfig,
  currentCycle: Cycle,
  user: AddressDriverUser,
  excludingSqueezes: SqueezedStreamsEvent[],
): AssetConfigEstimates {
  /*
    TODO: Avoid processing the current cycle twice by bounding totalEstimate to before the current cycle,
    and adding the estimates up.
  */
  const totalEstimate = estimateAssetConfig(
    assetConfig,
    { from: 0, to: Number.MAX_SAFE_INTEGER },
    user,
  );
  const currentCycleEstimate = estimateAssetConfig(
    assetConfig,
    {
      from: currentCycle.start.getTime(),
      to: currentCycle.start.getTime() + currentCycle.duration,
    },
    user,
    excludingSqueezes,
  );

  return {
    total: totalEstimate,
    currentCycle: currentCycleEstimate,
  };
}

export function estimateAssetConfig(
  assetConfig: AssetConfig,
  window: TimeWindow,
  user: AddressDriverUser,
  excludingSqueezes: SqueezedStreamsEvent[] = [],
): AssetConfigEstimate {
  // Filter out any history items not relevant to the current time window.
  const relevantHistoryItems = assetConfig.history.filter((hi) => {
    const timestamp = hi.timestamp.getTime();
    const nextTimestamp =
      assetConfig.history[assetConfig.history.indexOf(hi) + 1]?.timestamp.getTime();

    const startsWithinWindow = timestamp <= window.to && timestamp >= window.from;
    const windowIsAfterLastEvent = !nextTimestamp && timestamp < window.from;
    const endsWithinWindow = nextTimestamp && nextTimestamp >= window.from;

    return startsWithinWindow || windowIsAfterLastEvent || endsWithinWindow;
  });

  const historyItemEstimates = relevantHistoryItems.map((historyItem, index, historyItems) => {
    const nextHistoryItem = historyItems[index + 1];

    return estimateHistoryItem(
      window,
      historyItem,
      nextHistoryItem,
      assetConfig.tokenAddress,
      user,
      excludingSqueezes,
    );
  });

  const streamTotals = historyItemEstimates.reduce<{ [stream: StreamId]: StreamEstimate }>(
    (acc, historyItemEstimate) => {
      const nextItem = historyItemEstimates[historyItemEstimates.indexOf(historyItemEstimate) + 1];
      const { streams } = historyItemEstimate;

      for (const stream of streams) {
        const currentVal = acc[stream.id];

        acc[stream.id] = {
          ...stream,
          ...acc[stream.id],
          totalStreamed: (currentVal?.totalStreamed ?? 0n) + stream.totalStreamed,
          currentAmountPerSecond: nextItem ? 0n : stream.currentAmountPerSecond,
        };
      }

      return acc;
    },
    {},
  );

  const streams = unwrapIdItems(streamTotals);

  const totalStreamed = sumEstimates('totalStreamed', streams);
  const totalAmountPerSecond = sumEstimates('currentAmountPerSecond', streams);
  const { remainingBalance } = historyItemEstimates[historyItemEstimates.length - 1]?.totals ?? 0n;

  return {
    streams,
    totals: {
      totalStreamed,
      totalAmountPerSecond,
      remainingBalance,
    },
  };
}

function estimateHistoryItem(
  window: TimeWindow,
  historyItem: AssetConfigHistoryItem,
  nextHistoryItem: AssetConfigHistoryItem,
  tokenAddress: string,
  sender: AddressDriverUser,
  excludingSqueezes: SqueezedStreamsEvent[],
): AssetConfigEstimate {
  const streamEstimates = historyItem.streams.map((receiver) => {
    const estimate = streamedByStream(
      window,
      receiver,
      sender,
      historyItem,
      excludingSqueezes,
      nextHistoryItem,
    );

    return {
      id: receiver.streamId,
      totalStreamed: estimate.streamed,
      currentAmountPerSecond: estimate.currentAmountPerSecond,
      receiver: receiver.receiver,
      sender,
      tokenAddress,
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
  sender: AddressDriverUser,
  historyItem: AssetConfigHistoryItem,
  excludingSqueezes: SqueezedStreamsEvent[],
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

  const squeezedAtBlockTimestamp = excludingSqueezes.find(
    (squeezeEvent) =>
      squeezeEvent.senderId === sender.userId &&
      squeezeEvent.streamsHistoryHashes.includes(historyItem.historyHash),
  )?.blockTimestamp;
  const squeezedAt: Millis | undefined = squeezedAtBlockTimestamp
    ? Number(squeezedAtBlockTimestamp) * 1000
    : undefined;

  const streamingFrom = minMax('max', timestamp, start, window.from, squeezedAt);
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
