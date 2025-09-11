import z from 'zod';
import { userSchema } from './user';

export const roundStateSchema = z.union([
  z.literal('pending-intake'),
  z.literal('intake'),
  z.literal('pending-voting'),
  z.literal('voting'),
  z.literal('pending-results'),
  z.literal('results'),
]);
export type RoundState = z.infer<typeof roundStateSchema>;

export const possibleColorSchema = z.union([
  z.literal('#27C537'),
  z.literal('#FF5F5F'),
  z.literal('#5FB2FF'),
  z.literal('#9A5E27'),
  z.literal('#9B5DFF'),
  z.literal('#FF84DC'),
  z.literal('#FFA24B'),
  z.literal('#27939A'),
  z.literal('#FFAB99'),
  z.literal('#FF7020'),
  z.literal('#FFC120'),
  z.literal('#BD4139'),
  z.literal('#5555FF'),
  z.literal('#BBA781'),
  z.literal('#9BD226'),
]);
export type PossibleColor = z.infer<typeof possibleColorSchema>;

export const roundSchema = z.object({
  id: z.string(),
  published: z.boolean(),
  chainId: z.number(),
  emoji: z.string(),
  color: possibleColorSchema,
  urlSlug: z.string().nullable(),
  state: roundStateSchema.nullable(),
  name: z.string().nullable(),
  customAvatarCid: z.string().nullable(),
  description: z.string().nullable(),
  applicationPeriodStart: z.coerce.date().nullable(),
  applicationPeriodEnd: z.coerce.date().nullable(),
  votingPeriodStart: z.coerce.date().nullable(),
  votingPeriodEnd: z.coerce.date().nullable(),
  resultsPeriodStart: z.coerce.date().nullable(),
  maxVotesPerVoter: z.number().nullable(),
  maxVotesPerProjectPerVoter: z.number().nullable(),
  voterGuidelinesLink: z.string().nullable(),
  createdByUser: userSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  resultsCalculated: z.boolean(),
  resultsPublished: z.boolean(),
  isAdmin: z.boolean(),
  isVoter: z.boolean(),
  linkedDripLists: z.string().array(),
  validation: z
    .object({
      scheduleValid: z.boolean(),
      readyToPublish: z.boolean(),
      applicationFormValid: z.boolean(),
    })
    .nullable(),
  adminCount: z.number().nullable(),
  kycProvider: z.enum(['Fern']).nullable(),
});
export type Round = z.infer<typeof roundSchema>;

export type CreateRoundDto = {
  draft: true;
  emoji: string;
  chainId: number;
  color: PossibleColor;
  name: string | null;
  customAvatarCid: string | null;
  urlSlug: string | null;
  description: string | null;
  applicationPeriodStart: Date | null;
  applicationPeriodEnd: Date | null;
  votingPeriodStart: Date | null;
  votingPeriodEnd: Date | null;
  resultsPeriodStart: Date | null;
  maxVotesPerVoter: number | null;
  maxVotesPerProjectPerVoter: number | null;
  voterGuidelinesLink: string | null;
  kycProvider: 'Fern' | null;
};

export type PatchRoundDto = Partial<Omit<CreateRoundDto, 'draft' | 'chainId'>>;

export const slugAvailableResponseSchema = z.object({
  available: z.boolean(),
});
