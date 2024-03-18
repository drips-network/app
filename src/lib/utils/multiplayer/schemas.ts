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
  publisherAddress: z.string(),
});

export type VotingRound = z.infer<typeof getVotingRoundResponseSchema>;
