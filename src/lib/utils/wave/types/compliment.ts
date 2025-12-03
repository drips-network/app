import z from 'zod';

export const complimentTypeSchema = z.enum([
  'good_communicator',
  'fast_and_easy',
  'high_quality_code',
  'problem_solver',
]);
export type ComplimentType = z.infer<typeof complimentTypeSchema>;

export const giveComplimentItemSchema = z.object({
  issueId: z.uuid(),
  complimentType: complimentTypeSchema,
  reason: z.string().max(500).optional(),
});
export type GiveComplimentItem = z.infer<typeof giveComplimentItemSchema>;
