import type { Ballot, InProgressBallot } from './types/ballot';
import type { Round } from './types/round';

type RoundBallotConstraints = Pick<
  Round,
  'minVotesPerProjectPerVoter' | 'maxVotesPerProjectPerVoter'
>;

const POSITIVE_INTEGER_ERROR = 'Invalid ballot: votes must be positive integers';
const EMPTY_BALLOT_ERROR = 'Invalid ballot: must have at least one entry and no null values';
const NUMBER_TYPE_ERROR = 'Invalid ballot: votes must be numbers';

function normalizeVote(rawVote: number | string): number | null {
  if (typeof rawVote === 'string') {
    const trimmed = rawVote.trim();
    if (trimmed === '') {
      return null;
    }
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) {
      throw new Error(NUMBER_TYPE_ERROR);
    }
    return parsed;
  }

  if (Number.isNaN(rawVote)) {
    throw new Error(NUMBER_TYPE_ERROR);
  }

  return rawVote;
}

export function prepareBallotForSubmission(
  inProgressBallot: InProgressBallot,
  round: RoundBallotConstraints,
): Ballot {
  const sanitizedEntries = Object.entries(inProgressBallot).reduce<[string, number][]>(
    (entries, [applicationId, rawVote]) => {
      if (rawVote === null || rawVote === undefined) {
        return entries;
      }

      const normalized = normalizeVote(rawVote);

      if (normalized === null) {
        return entries;
      }

      if (!Number.isFinite(normalized)) {
        throw new Error(NUMBER_TYPE_ERROR);
      }

      if (!Number.isInteger(normalized) || normalized <= 0) {
        throw new Error(POSITIVE_INTEGER_ERROR);
      }

      if (
        round.minVotesPerProjectPerVoter !== null &&
        normalized < round.minVotesPerProjectPerVoter
      ) {
        throw new Error(
          `Invalid ballot: votes per project must be at least ${round.minVotesPerProjectPerVoter}.`,
        );
      }

      if (
        round.maxVotesPerProjectPerVoter !== null &&
        normalized > round.maxVotesPerProjectPerVoter
      ) {
        throw new Error(
          `Invalid ballot: votes per project must not exceed ${round.maxVotesPerProjectPerVoter}.`,
        );
      }

      entries.push([applicationId, normalized]);

      return entries;
    },
    [],
  );

  if (sanitizedEntries.length === 0) {
    throw new Error(EMPTY_BALLOT_ERROR);
  }

  return Object.fromEntries(sanitizedEntries) as Ballot;
}

export const ballotValidationErrors = {
  POSITIVE_INTEGER_ERROR,
  EMPTY_BALLOT_ERROR,
  NUMBER_TYPE_ERROR,
} as const;
