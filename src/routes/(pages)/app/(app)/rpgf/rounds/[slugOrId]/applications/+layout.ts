import { getApplicationCategories, getApplications } from '$lib/utils/rpgf/rpgf';
import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';
import storedWritable from '@efstajas/svelte-stored-writable';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export type SortByParam = 'name' | 'createdAt' | 'allocation';
export type FilterParam = 'own' | 'approved' | 'rejected' | 'pending' | `cat-${string}`;

export const load = async ({ parent, route, url, depends }) => {
  depends('rpgf:round:listing-applications');

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

  // If true, display sidebar that lets admins review applications
  const reviewMode =
    route.id !== '/(pages)/app/(app)/rpgf/rounds/[slugOrId]/applications/new' &&
    round.isAdmin &&
    (round.state === 'intake' || round.state === 'pending-voting');

  const { resultsPublished } = round;

  // parse and validate params using Zod, fall back to default if invalid or missing
  const sortByParam = z
    .union([z.literal('name'), z.literal('createdAt'), z.literal('allocation')])
    .safeParse(url.searchParams.get('sortBy')).success
    ? (url.searchParams.get('sortBy') as 'name' | 'createdAt' | 'allocation')
    : resultsPublished
      ? 'allocation'
      : 'createdAt';

  const filterParam = z
    .union([
      z.literal('own'),
      z.literal('approved'),
      z.literal('rejected'),
      z.literal('pending'),
      z.string().regex(/^cat-.*/),
    ])
    .safeParse(url.searchParams.get('filter')).success
    ? (url.searchParams.get('filter') as FilterParam)
    : null;

  const [allApplications, categories] = await Promise.all([
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
        ),
    getApplicationCategories(fetch, round.id),
  ]);

  return {
    reviewMode,
    voteMode,
    ballot: ballotWritable,
    resultsMode,
    allApplications,
    sortByParam,
    categories,
    filterParam,
  };
};

export const ssr = false;
