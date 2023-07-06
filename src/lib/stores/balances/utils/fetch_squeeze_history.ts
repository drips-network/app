import { getSubgraphClient } from '$lib/utils/get-drips-clients';

export default async function fetchSqueezeHistory(accountId: string) {
  const client = getSubgraphClient();

  // TODO: Only fetch squeezes within current cycle
  return await client.getSqueezedStreamsEventsByAccountId(accountId);
}
