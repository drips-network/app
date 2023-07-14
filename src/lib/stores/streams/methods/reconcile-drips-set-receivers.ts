import deduplicateArray from '$lib/utils/deduplicate-array';
import type { StreamsSetEvent } from 'radicle-drips';
import sortStreamsSetEvents from './sort-drips-set-events';

interface DtreamReceiverSeenEvent {
  id: string;
  receiverAccountId: string;
  config: bigint;
}

export type StreamsSetEventWithFullReceivers = {
  currentReceivers: DtreamReceiverSeenEvent[];
} & StreamsSetEvent;

type ReceiversHash = string;

/**
 * Currently, `streamsSetEvents` as queried from our subgraph don't include the historic state of receivers
 * at the time of update. This function takes all historically seen drips receivers, and enriches a set of
 * `streamsSetEvents` with a new `currentReceivers` key that includes the full state of receivers at the time
 * of update.
 *
 * Context: https://discord.com/channels/841318878125490186/930862758017245215/1032982499380445256
 *
 * @param streamsSetEvents The drips set events to enrich.
 * @returns The same drips set events, with an additional `currentReceivers` key, containing all receivers
 * that were configured on-chain at the time of update.
 */
export function reconcileStreamsSetReceivers(
  streamsSetEvents: StreamsSetEvent[],
): StreamsSetEventWithFullReceivers[] {
  const sortedStreamsSetEvents = sortStreamsSetEvents(streamsSetEvents);

  const receiversHashes = sortedStreamsSetEvents.reduce<ReceiversHash[]>((acc, streamsSetEvent) => {
    const { receiversHash } = streamsSetEvent;

    return !acc.includes(receiversHash) ? [...acc, receiversHash] : acc;
  }, []);

  const streamReceiverSeenEventsByReceiversHash = receiversHashes.reduce<{
    [receiversHash: string]: DtreamReceiverSeenEvent[];
  }>((acc, receiversHash) => {
    const receivers = deduplicateArray(
      sortedStreamsSetEvents
        .filter((event) => event.receiversHash === receiversHash)
        .reduce<DtreamReceiverSeenEvent[]>(
          (acc, event) => [...acc, ...event.streamReceiverSeenEvents],
          [],
        ),
      'config',
    );

    return {
      ...acc,
      [receiversHash]: receivers,
    };
  }, {});

  return sortedStreamsSetEvents.reduce<StreamsSetEventWithFullReceivers[]>(
    (acc, streamsSetEvent) => [
      ...acc,
      {
        ...streamsSetEvent,
        currentReceivers:
          streamReceiverSeenEventsByReceiversHash[streamsSetEvent.receiversHash] ?? [],
      },
    ],
    [],
  );
}
