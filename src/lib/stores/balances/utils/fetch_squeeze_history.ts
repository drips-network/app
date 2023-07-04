import { getSubgraphClient } from '$lib/utils/get-drips-clients';

export default async function fetchSqueezeHistory(userId: string) {
  const client = getSubgraphClient();

  // TODO: Only fetch squeezes within current cycle
  return await client.getSqueezedStreamsEventsByUserId(userId);
}
