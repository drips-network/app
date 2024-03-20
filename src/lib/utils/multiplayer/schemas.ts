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
  description: z.string().optional().nullable(),
  publisherAddress: z.string(),
});

export type VotingRound = z.infer<typeof getVotingRoundResponseSchema>;

export const pendingVoteSchema = z.object({
  collaboratorAddress: z.string(),
});

export const addressVoteSchema = pendingVoteSchema.extend({
  address: z.string(),
  type: z.literal('address'),
  weight: z.number(),
  accountId: z.string(),
});

export const projectVoteSchema = pendingVoteSchema.extend({
  url: z.string(),
  type: z.literal('project'),
  weight: z.number(),
  accountId: z.string(),
});

export const voteSchema = z.union([pendingVoteSchema, addressVoteSchema, projectVoteSchema]);

export type AddressVote = z.infer<typeof addressVoteSchema>;
export type ProjectVote = z.infer<typeof projectVoteSchema>;
export type Vote = z.infer<typeof voteSchema>;
