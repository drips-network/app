import type { StreamReceiver } from '../sdk-types';

export const formatStreamReceivers = (receivers: StreamReceiver[]) => {
  // Drips receivers must be sorted by user ID and config, deduplicated, and without amount per second <= 0.

  const uniqueReceivers = receivers.reduce((unique: StreamReceiver[], o) => {
    if (
      !unique.some(
        (obj: StreamReceiver) => obj.accountId === o.accountId && obj.config === o.config,
      )
    ) {
      unique.push(o);
    }
    return unique;
  }, []);

  const sortedReceivers = uniqueReceivers
    // Sort by accountId.
    .sort((a, b) =>
      a.accountId > b.accountId
        ? 1
        : a.accountId < b.accountId
          ? -1
          : // Sort by config.
            a.config > b.config
            ? 1
            : a.config < b.config
              ? -1
              : 0,
    );
  return sortedReceivers;
};
