import type { InProgressBallot } from '$lib/utils/rpgf/types/ballot';
import storedWritable from '@efstajas/svelte-stored-writable';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async ({ parent, route }) => {
  const { round, existingBallot } = await parent();

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

  return {
    reviewMode,
    voteMode,
    ballot: ballotWritable,
    resultsMode,
  };
};

export const ssr = false;
