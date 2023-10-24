import DripListService from '$lib/utils/driplist/DripListService';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRepresentationalSplitsForAccount } from '$lib/utils/drips/splits';
import getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
import getIncomingSplitTotal from '$lib/utils/splits/get-incoming-split-total';

// TODO: This fails if the network is not the default one. We need to support other networks.

export const load = (async ({ params }) => {
  const { listId } = params;

  const dripListService = await DripListService.new();

  const dripList = await dripListService.getByTokenId(listId);
  dripList?.projects;
  if (!dripList) throw error(404);

  const fetches = await Promise.all([
    getRepresentationalSplitsForAccount(listId, dripList.projects),
    getIncomingSplits(listId),
    getIncomingSplitTotal(listId),
  ] as const);

  return {
    dripList,
    representationalSplits: fetches[0],
    incomingSplits: fetches[1],
    incomingSplitsTotal: fetches[2],
    blockWhileInitializing: false,
  };
}) satisfies PageServerLoad;
