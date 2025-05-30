import { ballotSchema, type InProgressBallot } from '$lib/utils/rpgf/schemas';
import storedWritable from '@efstajas/svelte-stored-writable';
import { writable } from 'svelte/store';
import { z } from 'zod';

export const load = async ({ parent }) => {
  const { isRoundAdmin, applications, wrappedRound, isRoundVoter } =
    await parent();

  const reviewMode =
    isRoundAdmin && applications.length > 0 &&
      (wrappedRound.round.state === "intake" ||
    wrappedRound.round.state === "pending-voting");

  const voteMode =
    isRoundVoter && applications.length > 0 &&
      wrappedRound.round.state === "voting";

  const ballotWritable = storedWritable<InProgressBallot>('in-progress-ballot', z.record(z.string(), z.number().nullable()), {});

  return {
    reviewMode,
    voteMode,
    decisions: writable<Record<string, 'approve' | 'reject' | null>>({}),
    ballot: ballotWritable,
  }
};

export const ssr = false;
