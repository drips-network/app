import { Utils, type StreamsSetEvent } from 'radicle-drips';
import sortStreamsSetEvents from './sort-drips-set-events';

/**
 * Take an array of streamsSetEvents, and group them by their asset's token address.
 * @param streamsSetEvents The array of events to group by token address.
 * @returns An object with keys corresponding to token addresses, and values being
 * relevant streamsSetEvents.
 */
export default function seperateStreamsSetEvents<T extends StreamsSetEvent>(
  streamsSetEvents: T[],
): {
  [tokenAddress: string]: T[];
} {
  const sorted = sortStreamsSetEvents(streamsSetEvents);

  const result = sorted.reduce<{ [tokenAddress: string]: T[] }>((acc, streamsSetEvent) => {
    const { assetId } = streamsSetEvent;
    const tokenAddress = Utils.Asset.getAddressFromId(assetId);

    if (acc[tokenAddress]) {
      acc[tokenAddress].push(streamsSetEvent);
    } else {
      acc[tokenAddress] = [streamsSetEvent];
    }

    return acc;
  }, {});

  return result;
}
