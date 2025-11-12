import { describe, expect, it } from 'vitest';
import type { InProgressBallot } from './types/ballot';
import type { Round } from './types/round';
import { ballotValidationErrors, prepareBallotForSubmission } from './validate-ballot';

const roundConstraints = {
  minVotesPerProjectPerVoter: 10,
  maxVotesPerProjectPerVoter: 100,
} satisfies Pick<Round, 'minVotesPerProjectPerVoter' | 'maxVotesPerProjectPerVoter'>;

describe('prepareBallotForSubmission', () => {
  it('returns a sanitized ballot when all entries meet constraints', () => {
    const ballot: InProgressBallot = {
      'app-1': 20,
      'app-2': '15',
      'app-3': null,
    };

    expect(prepareBallotForSubmission(ballot, roundConstraints)).toEqual({
      'app-1': 20,
      'app-2': 15,
    });
  });

  it('throws when a vote falls below the round minimum', () => {
    const ballot: InProgressBallot = {
      'app-1': 5,
    };

    expect(() => prepareBallotForSubmission(ballot, roundConstraints)).toThrow(
      'Invalid ballot: votes per project must be at least 10.',
    );
  });

  it('throws when a vote exceeds the round maximum', () => {
    const ballot: InProgressBallot = {
      'app-1': 150,
    };

    expect(() => prepareBallotForSubmission(ballot, roundConstraints)).toThrow(
      'Invalid ballot: votes per project must not exceed 100.',
    );
  });

  it('throws when votes are non-positive integers', () => {
    const ballotZero: InProgressBallot = {
      'app-1': 0,
    };

    expect(() => prepareBallotForSubmission(ballotZero, roundConstraints)).toThrow(
      ballotValidationErrors.POSITIVE_INTEGER_ERROR,
    );

    const ballotNegative: InProgressBallot = {
      'app-1': -5,
    };

    expect(() => prepareBallotForSubmission(ballotNegative, roundConstraints)).toThrow(
      ballotValidationErrors.POSITIVE_INTEGER_ERROR,
    );
  });

  it('allows submissions when no minimum is configured', () => {
    const roundWithoutMin = {
      ...roundConstraints,
      minVotesPerProjectPerVoter: null,
    } satisfies Pick<Round, 'minVotesPerProjectPerVoter' | 'maxVotesPerProjectPerVoter'>;

    const ballot: InProgressBallot = {
      'app-1': 1,
    };

    expect(prepareBallotForSubmission(ballot, roundWithoutMin)).toEqual({
      'app-1': 1,
    });
  });
});
