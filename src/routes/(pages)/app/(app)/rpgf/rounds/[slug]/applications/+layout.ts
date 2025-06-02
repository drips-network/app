import type { InProgressBallot } from '$lib/utils/rpgf/schemas';
import storedWritable from '@efstajas/svelte-stored-writable';
import { writable } from 'svelte/store';
import { z } from 'zod';

export const load = async ({ parent, route }) => {
  const { isRoundAdmin, applications, wrappedRound, isRoundVoter } = await parent();

  const reviewMode =
    route.id !== '/(pages)/app/(app)/rpgf/rounds/[slug]/applications/new' &&
    isRoundAdmin &&
    applications.length > 0 &&
    (wrappedRound.round.state === 'intake' || wrappedRound.round.state === 'pending-voting');

  const voteMode = isRoundVoter && applications.length > 0 && wrappedRound.round.state === 'voting';

  const ballotLocalStorageKey = `in-progress-ballot-${wrappedRound.round.urlSlug}`;

  const ballotWritable = storedWritable<InProgressBallot>(
    ballotLocalStorageKey,
    z.record(z.string(), z.number().nullable()),
    {},
  );

  return {
    reviewMode,
    voteMode,
    decisions: writable<Record<string, 'approve' | 'reject' | null>>({}),
    ballot: ballotWritable,
  };
};

export const ssr = false;
