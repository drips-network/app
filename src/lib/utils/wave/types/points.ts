import z from 'zod';
import { waveCycleDtoSchema, waveDtoSchema } from './wave';
import { complimentTypeSchema } from './compliment';

export const pointsDtoSchema = z.object({
  userId: z.uuid(),
  totalPoints: z.number().int().nonnegative(),
  updatedAt: z.coerce.date(),
});
export type PointsDto = z.infer<typeof pointsDtoSchema>;

export const pointsIssueDtoSchema = z.object({
  title: z.string(),
  gitHubIssueNumber: z.number(),
  repo: z.object({
    owner: z.string(),
    name: z.string(),
  }),
});

export const pointsComplimentDtoSchema = z.object({
  type: complimentTypeSchema,
  issue: pointsIssueDtoSchema,
});

export const pointsSourceSchema = z.union([
  z.object({
    type: z.literal('issue'),
    data: pointsIssueDtoSchema,
  }),
  z.object({
    type: z.literal('compliment'),
    data: pointsComplimentDtoSchema,
  }),
  z.object({
    type: z.literal('adjustment'),
    data: z.null(),
  }),
]);
export type PointsSource = z.infer<typeof pointsSourceSchema>;

export const pointsLedgerEntryDtoSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  points: z.number().int(),
  reason: z.string().nullable(),
  source: pointsSourceSchema,
  referenceEntryId: z.uuid().nullable(),
  wave: waveDtoSchema.nullable(),
  waveCycle: waveCycleDtoSchema.nullable(),
  metadata: z.record(z.string(), z.unknown()),
  occurredAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});
export type PointsLedgerEntryDto = z.infer<typeof pointsLedgerEntryDtoSchema>;
