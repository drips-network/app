import { getApplications } from '$lib/utils/rpgf/rpgf.js';
import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';
import storedWritable from '@efstajas/svelte-stored-writable';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async ({ parent, route, url, depends, fetch }) => {
  depends('rpgf:round:applications');

  const { round, existingBallot, rpgfUserData } = await parent();

  if (!round.published) {
    throw error(404);
  }

  // If true, display sidebar that lets admins calculate & publish results
  const resultsMode =
    round.isAdmin && (round.state === 'results' || round.state === 'pending-results');

  // If true, display sidebar that lets voters vote on applications
  const voteMode = round.isVoter && round.state === 'voting';

  const ballotLocalStorageKey = `in-progress-ballot-${round.urlSlug}`;

  // Todo(RPGF): Defining a writable here is a bit of a hack. Need to find a neater solution to handle
  // this state
  const ballotWritable = storedWritable<InProgressBallot>(
    ballotLocalStorageKey,
    z.record(z.string(), z.number().nullable()),
    existingBallot?.ballot ?? {},
  );

  const { resultsPublished } = round;

  const sortByParam: string =
    url.searchParams.get('sortBy') ?? (resultsPublished ? 'allocation' : 'createdAt');
  const filterParam: string | null = url.searchParams.get('filter');

  const allApplications =
    filterParam === 'own' && !rpgfUserData
      ? []
      : await getApplications(
          fetch,
          round.id,
          100000, // Fetch all applications, later we can paginate
          0,
          (() => {
            switch (sortByParam) {
              case 'createdAt':
                return 'createdAt:desc';
              case 'name':
                return 'name:asc';
              case 'allocation':
                return 'allocation:desc';
              default:
                return undefined;
            }
          })(),
          filterParam === 'own' && rpgfUserData ? rpgfUserData.userId : null,
          filterParam === 'approved' || filterParam === 'rejected' || filterParam === 'pending'
            ? filterParam
            : undefined,
          filterParam?.startsWith('cat-') ? filterParam.replaceAll('cat-', '') : undefined,
        );

  // If true, display sidebar that lets admins review applications
  const reviewMode =
    route.id !== '/(pages)/app/(app)/rpgf/rounds/[slugOrId]/applications/new' &&
    round.isAdmin &&
    (round.state === 'intake' || round.state === 'pending-voting');

  return {
    reviewMode,
    voteMode,
    ballot: ballotWritable,
    allApplications,
    sortByParam,
    filterParam,
    resultsMode,
  };
};

export const ssr = false;
