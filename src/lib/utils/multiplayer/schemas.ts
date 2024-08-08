import { z } from 'zod';

export const startVotingRoundResponseSchema = z.object({
  newVotingRoundId: z.string(),
});

export const addressVoteReceiverSchema = z.object({
  address: z.string(),
  type: z.literal('address'),
  weight: z.number(),
});

export const projectVoteReceiverSchema = z.object({
  url: z.string(),
  type: z.literal('project'),
  weight: z.number(),
});

export const dripListVoteReceiverSchema = z.object({
  type: z.literal('dripList'),
  weight: z.number(),
  accountId: z.string(),
});

export const voteReceiverSchema = z.union([
  addressVoteReceiverSchema,
  projectVoteReceiverSchema,
  dripListVoteReceiverSchema,
]);

export const addressSchema = z.object({
  type: z.literal('address'),
  address: z.string(),
});

export const projectSchema = z.object({
  type: z.literal('project'),
  url: z.string(),
});

export const dripListSchema = z.object({
  type: z.literal('dripList'),
  accountId: z.string(),
});

export const pendingVoteSchema = z.object({
  collaboratorAddress: z.string(),
  latestVote: z.null(),
});

export const submittedVoteSchema = pendingVoteSchema.extend({
  collaboratorAddress: z.string(),
  latestVote: z.array(voteReceiverSchema),
});

export const voteSchema = z.union([submittedVoteSchema, pendingVoteSchema]);

export const getVotingRoundVotesResponseSchema = z.object({
  votes: z.array(voteSchema),
});

export const getVotingRoundResultsResponseSchema = z.object({
  result: z.array(voteReceiverSchema),
});

export const getCollaboratorResponseSchema = z.object({
  isCollaborator: z.boolean(),
  hasVoted: z.boolean(),
  latestVote: z.array(voteReceiverSchema).nullable(),
});

export const getVotingRoundResponseSchema = z.object({
  id: z.string(),
  schedule: z.object({
    voting: z.object({
      startsAt: z.string(),
      endsAt: z.string(),
    }),
  }),
  status: z.union([
    z.literal('Started'),
    z.literal('Completed'),
    z.literal('Linked'),
    z.literal('PendingLinkCompletion'),
  ]),
  dripListId: z.nullable(z.string()),
  name: z.string(),
  description: z.string().nullable(),
  linkedAt: z.string().nullable(),
  areVotesPrivate: z.boolean(),
  publisherAddress: z.string(),
  result: z.array(voteReceiverSchema).nullable(),
  votes: z.array(voteSchema).nullable(),
  allowedReceivers: z.array(z.union([addressSchema, projectSchema, dripListSchema])),
});

export const revealResultsResponseSchema = z.object({
  result: z.array(voteReceiverSchema),
});

export type VotingRound = z.infer<typeof getVotingRoundResponseSchema>;
export type AddressVoteReceiver = z.infer<typeof addressVoteReceiverSchema>;
export type ProjectVoteReceiver = z.infer<typeof projectVoteReceiverSchema>;
export type DripListVoteReceiver = z.infer<typeof dripListVoteReceiverSchema>;
export type VoteReceiver = z.infer<typeof voteReceiverSchema>;
export type Vote = z.infer<typeof voteSchema>;
export type Collaborator = z.infer<typeof getCollaboratorResponseSchema>;
