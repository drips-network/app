import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import { Utils } from 'radicle-drips';
import unreachable from '../unreachable';

export default async function relevantTokens(
  forBalance: 'receivable' | 'splittable' | 'collectable',
  accountId: string,
) {
  const subgraph = getSubgraphClient();

  let assetIds: string[];

  switch (forBalance) {
    case 'receivable':
      assetIds = (await subgraph.getStreamReceiverSeenEventsByReceiverId(accountId)).map((e) =>
        Utils.Asset.getAddressFromId(e.streamsSetEvent.assetId),
      );
      break;
    case 'splittable':
    case 'collectable': {
      const events = (
        await Promise.all([
          subgraph.getGivenEventsByReceiverAccountId(accountId),
          subgraph.getSplitEventsByReceiverAccountId(accountId),
          subgraph.getStreamReceiverSeenEventsByReceiverId(accountId),
        ] as const)
      ).flat();

      assetIds = events.map((e) => {
        let assetId: bigint;

        if ('streamsSetEvent' in e) {
          assetId = e.streamsSetEvent.assetId;
        } else if ('assetId' in e) {
          assetId = e.assetId;
        } else {
          unreachable();
        }

        return Utils.Asset.getAddressFromId(assetId);
      });
      break;
    }
  }

  return new Set(assetIds);
}
