import { z } from 'zod';

export const startVotingRoundResponseSchema = z.object({
  newVotingRoundId: z.string(),
});

export const getVotingRoundResponseSchema = z.object({
  id: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  status: z.string(),
  dripListId: z.nullable(z.string()),
  name: z.string(),
  description: z.string(),
  votes: z.array(
    z.object({
      collaboratorAddress: z.string(),
    }),
  ),
  // TODO: Real schema
  result: z.array(z.unknown()),
});

export const getVotingRoundsResponseSchema = z.object({
  votingRounds: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
    }),
  ),
});
