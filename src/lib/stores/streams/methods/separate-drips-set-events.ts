import { Utils, type DripsSetEvent } from 'radicle-drips';
import sortDripsSetEvents from './sort-drips-set-events';

/**
 * Take an array of dripsSetEvents, and group them by their asset's token address.
 * @param dripsSetEvents The array of events to group by token address.
 * @returns An object with keys corresponding to token addresses, and values being
 * relevant dripsSetEvents.
 */
export default function seperateDripsSetEvents<T extends DripsSetEvent>(
  dripsSetEvents: T[],
): {
  [tokenAddress: string]: T[];
} {
  const sorted = sortDripsSetEvents(dripsSetEvents);

  const result = sorted.reduce<{ [tokenAddress: string]: T[] }>((acc, dripsSetEvent) => {
    const { assetId } = dripsSetEvent;
    const tokenAddress = Utils.Asset.getAddressFromId(assetId);

    if (acc[tokenAddress]) {
      acc[tokenAddress].push(dripsSetEvent);
    } else {
      acc[tokenAddress] = [dripsSetEvent];
    }

    return acc;
  }, {});

  return result;
}
