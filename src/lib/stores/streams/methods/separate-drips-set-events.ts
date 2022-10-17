import { Utils, type DripsSubgraphTypes } from 'radicle-drips';

/**
 * Take an array of dripsSetEvents, and group them by their asset's token address.
 * @param dripsSetEvents The array of events to group by token address.
 * @returns An object with keys corresponding to token addresses, and values being
 * relevant dripsSetEvents.
 */
export default function seperateDripsSetEvents(
  dripsSetEvents: DripsSubgraphTypes.DripsSetEvent[],
): {
  [tokenAddress: string]: DripsSubgraphTypes.DripsSetEvent[];
} {
  return dripsSetEvents.reduce<{ [tokenAddress: string]: DripsSubgraphTypes.DripsSetEvent[] }>(
    (acc, dripsSetEvent) => {
      const { assetId } = dripsSetEvent;
      const tokenAddress = Utils.Asset.getAddressFromId(assetId);

      if (acc[tokenAddress]) {
        acc[tokenAddress].push(dripsSetEvent);
      } else {
        acc[tokenAddress] = [dripsSetEvent];
      }

      return acc;
    },
    {},
  );
}
