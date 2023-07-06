import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import { Utils } from 'radicle-drips';

export default async function relevantTokens(
  forBalance: 'receivable' | 'splittable',
  accountId: string,
) {
  const subgraph = getSubgraphClient();

  let assetIds: string[];

  if (forBalance === 'receivable') {
    assetIds = (await subgraph.getStreamReceiverSeenEventsByReceiverId(accountId)).map((e) =>
      Utils.Asset.getAddressFromId(e.streamsSetEvent.assetId),
    );
  } else {
    const events = await Promise.all([
      subgraph.getGivenEventsByReceiverAccountId(accountId),
      subgraph.getSplitEventsByReceiverAccountId(accountId),
    ]);

    assetIds = events.flat().map((e) => Utils.Asset.getAddressFromId(e.assetId));
  }

  return new Set(assetIds);
}
