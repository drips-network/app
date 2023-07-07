import DripListService from '$lib/utils/driplist/DripListService';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRepresentationalSplitsForAccount } from '$lib/utils/drips/splits';
import type { RepoDriverSplitReceiver } from '$lib/utils/metadata/types';

// TODO: This fails if the network is not the default one. We need to support other networks.

export const load = (async ({ params }) => {
  const { listId } = params;

  const dripListService = await DripListService.new();

  const dripList = await dripListService.getByTokenId(listId);
  dripList?.projects;
  if (!dripList) throw error(404);

  const representationalSplits = await getRepresentationalSplitsForAccount(
    listId,
    dripList.projects.filter((s): s is RepoDriverSplitReceiver => 'source' in s),
  );

  return {
    dripList,
    representationalSplits,
  };
}) satisfies PageServerLoad;
