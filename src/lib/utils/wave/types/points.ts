import z from 'zod';

export const pointsDtoSchema = z.object({
  userId: z.uuid(),
  totalPoints: z.number().int().nonnegative(),
  updatedAt: z.coerce.date(),
});
export type PointsDto = z.infer<typeof pointsDtoSchema>;

export const pointsLedgerEntryDtoSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  points: z.number().int(),
  reason: z.string().nullable(),
  sourceType: z.enum(['issue', 'compliment', 'adjustment']),
  sourceId: z.string().nullable(),
  referenceEntryId: z.uuid().nullable(),
  waveCycleId: z.uuid().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  occurredAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});
export type PointsLedgerEntryDto = z.infer<typeof pointsLedgerEntryDtoSchema>;
