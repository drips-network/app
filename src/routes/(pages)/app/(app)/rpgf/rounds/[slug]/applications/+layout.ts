import { getApplications } from '$lib/utils/rpgf/rpgf.js';
import type { InProgressBallot } from '$lib/utils/rpgf/schemas';
import storedWritable from '@efstajas/svelte-stored-writable';
import { z } from 'zod';

export const load = async ({ parent, route, url }) => {
  const { isRoundAdmin, applications, wrappedRound, isRoundVoter, existingBallot, rpgfUserData } =
    await parent();

  const reviewMode =
    route.id !== '/(pages)/app/(app)/rpgf/rounds/[slug]/applications/new' &&
    isRoundAdmin &&
    applications.length > 0 &&
    (wrappedRound.round.state === 'intake' || wrappedRound.round.state === 'pending-voting');

  const voteMode = isRoundVoter && applications.length > 0 && wrappedRound.round.state === 'voting';

  const ballotLocalStorageKey = `in-progress-ballot-${wrappedRound.round.urlSlug}`;

  // Todo(RPGF): Defining a writable here is a bit of a hack. Need to find a neater solution to handle
  // this state
  const ballotWritable = storedWritable<InProgressBallot>(
    ballotLocalStorageKey,
    z.record(z.string(), z.number().nullable()),
    existingBallot?.ballot ?? {},
  );

  const sortByParam = url.searchParams.get('sortBy') ?? 'createdAt';
  const filterParam = url.searchParams.get('filter');

  const allApplications =
    filterParam === 'own' && !rpgfUserData
      ? []
      : await getApplications(
          fetch,
          wrappedRound.round.urlSlug,
          wrappedRound.round.applicationFormat,
          100000, // Fetch all applications, later we can paginate
          0,
          (() => {
            switch (sortByParam) {
              case 'createdAt':
                return 'createdAt:desc';
              case 'name':
                return 'name:asc';
              default:
                return undefined;
            }
          })(),
          filterParam === 'own' && rpgfUserData ? rpgfUserData.userId : null,
          filterParam === 'pending' ? 'pending' : null,
        );

  return {
    reviewMode,
    voteMode,
    ballot: ballotWritable,
    allApplications,
    sortByParam,
    filterParam,
  };
};

export const ssr = false;
