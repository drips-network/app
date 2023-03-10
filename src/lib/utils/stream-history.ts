import type { AssetConfig, Receiver } from '$lib/stores/streams/types';

export default function getStreamHistory(assetConfig: AssetConfig, streamId: string) {
  const assetConfigHistory = assetConfig.history;

  return assetConfigHistory.reduce<
    { timestamp: Date; runsOutOfFunds?: Date; receiverConfig: Receiver }[]
  >((acc, hi) => {
    const matchingReceiver = hi.streams.find((receiver) => receiver.streamId === streamId);

    return matchingReceiver
      ? [
          ...acc,
          {
            timestamp: hi.timestamp,
            runsOutOfFunds: hi.runsOutOfFunds,
            receiverConfig: matchingReceiver,
          },
        ]
      : acc;
  }, []);
}
