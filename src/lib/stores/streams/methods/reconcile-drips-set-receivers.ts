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
