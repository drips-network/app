import z from 'zod';

export enum ComplimentType {
  GOOD_COMMUNICATOR = 'good_communicator',
  FAST_AND_EASY = 'fast_and_easy',
  HIGH_QUALITY_CODE = 'high_quality_code',
  PROBLEM_SOLVER = 'problem_solver',
}

export const COMPLIMENT_TYPES: Record<ComplimentType, { label: string; points: number }> = {
  [ComplimentType.GOOD_COMMUNICATOR]: {
    label: 'Good Communicator',
    points: 50,
  },
  [ComplimentType.FAST_AND_EASY]: {
    label: 'Fast & Easy',
    points: 50,
  },
  [ComplimentType.HIGH_QUALITY_CODE]: {
    label: 'High-Quality Code',
    points: 50,
  },
  [ComplimentType.PROBLEM_SOLVER]: {
    label: 'Problem Solver',
    points: 50,
  },
} as const;

export const complimentTypeSchema = z.enum(Object.values(ComplimentType));

export const giveComplimentItemSchema = z.object({
  issueId: z.uuid(),
  complimentType: complimentTypeSchema,
  reason: z.string().max(500).optional(),
});
export type GiveComplimentItem = z.infer<typeof giveComplimentItemSchema>;

export const issueComplimentDtoSchema = z.object({
  complimentType: complimentTypeSchema,
  points: z.number().int(),
  recipientGitHubUsername: z.string(),
  additionalReason: z.string().max(500).nullable(),
  createdAt: z.coerce.date(),
});
export type IssueComplimentDto = z.infer<typeof issueComplimentDtoSchema>;
