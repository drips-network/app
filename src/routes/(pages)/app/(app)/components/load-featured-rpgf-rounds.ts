import { getRounds } from '$lib/utils/rpgf/rpgf';

export default async function loadFeaturedRpgfRounds(
  roundIds: string[],
  fetch: typeof global.fetch,
) {
  if (roundIds.length === 0) {
    return [];
  }

  // Todo: optimize by fetching only the needed rounds,
  // fine for a while as amt of rounds is very small
  const allRounds = await getRounds(fetch);

  return allRounds.filter((round) => roundIds.includes(round.id));
}
