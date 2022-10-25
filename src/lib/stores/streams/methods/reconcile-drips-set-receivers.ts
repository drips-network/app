import deduplicateArray from '$lib/utils/deduplicate-array';
import type { DripsSetEvent } from 'radicle-drips';
import sortDripsSetEvents from './sort-drips-set-events';

interface DripsReceiverSeenEvent {
  id: string;
  receiverUserId: string;
  config: bigint;
}

export type DripsSetEventWithFullReceivers = {
  currentReceivers: DripsReceiverSeenEvent[];
} & DripsSetEvent;

type ReceiversHash = string;

/**
 * Currently, `dripsSetEvents` as queried from our subgraph don't include the historic state of receivers
 * at the time of update. This function takes all historically seen drips receivers, and enriches a set of
 * `dripsSetEvents` with a new `currentReceivers` key that includes the full state of receivers at the time
 * of update.
 *
 * Context: https://discord.com/channels/841318878125490186/930862758017245215/1032982499380445256
 *
 * @param dripsSetEvents The drips set events to enrich.
 * @returns The same drips set events, with an additional `currentReceivers` key, containing all receivers
 * that were configured on-chain at the time of update.
 */
export function reconcileDripsSetReceivers(
  dripsSetEvents: DripsSetEvent[],
): DripsSetEventWithFullReceivers[] {
  const sortedDripsSetEvents = sortDripsSetEvents(dripsSetEvents);

  const receiversHashes = sortedDripsSetEvents.reduce<ReceiversHash[]>((acc, dripsSetEvent) => {
    const { receiversHash } = dripsSetEvent;

    return !acc.includes(receiversHash) ? [...acc, receiversHash] : acc;
  }, []);

  const dripsReceiverSeenEventsByReceiversHash = receiversHashes.reduce<{
    [receiversHash: string]: DripsReceiverSeenEvent[];
  }>((acc, receiversHash) => {
    const receivers = deduplicateArray(
      sortedDripsSetEvents
        .filter((event) => event.receiversHash === receiversHash)
        .reduce<DripsReceiverSeenEvent[]>(
          (acc, event) => [...acc, ...event.dripsReceiverSeenEvents],
          [],
        ),
      'config',
    );

    return {
      ...acc,
      [receiversHash]: receivers,
    };
  }, {});

  return sortedDripsSetEvents.reduce<DripsSetEventWithFullReceivers[]>(
    (acc, dripsSetEvent) => [
      ...acc,
      {
        ...dripsSetEvent,
        currentReceivers: dripsReceiverSeenEventsByReceiversHash[dripsSetEvent.receiversHash] ?? [],
      },
    ],
    [],
  );
}
