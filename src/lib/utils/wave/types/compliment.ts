import FastAndEasy from '$lib/components/wave/compliment-illustrations/fast-and-easy.svelte';
import GoodCommunicator from '$lib/components/wave/compliment-illustrations/good-communicator.svelte';
import HighQualityCode from '$lib/components/wave/compliment-illustrations/high-quality-code.svelte';
import ProblemSolver from '$lib/components/wave/compliment-illustrations/problem-solver.svelte';
import type { Component } from 'svelte';
import z from 'zod';

export enum ComplimentType {
  GOOD_COMMUNICATOR = 'good_communicator',
  FAST_AND_EASY = 'fast_and_easy',
  HIGH_QUALITY_CODE = 'high_quality_code',
  PROBLEM_SOLVER = 'problem_solver',
}

export const COMPLIMENT_TYPES: Record<
  ComplimentType,
  { label: string; points: number; illustration: Component }
> = {
  [ComplimentType.GOOD_COMMUNICATOR]: {
    label: 'Good Communicator',
    points: 50,
    illustration: GoodCommunicator,
  },
  [ComplimentType.FAST_AND_EASY]: {
    label: 'Fast & Easy',
    points: 50,
    illustration: FastAndEasy,
  },
  [ComplimentType.HIGH_QUALITY_CODE]: {
    label: 'High-Quality Code',
    points: 50,
    illustration: HighQualityCode,
  },
  [ComplimentType.PROBLEM_SOLVER]: {
    label: 'Problem Solver',
    points: 50,
    illustration: ProblemSolver,
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

export const complimentCountSummarySchema = z.object({
  complimentType: complimentTypeSchema,
  label: z.string(),
  points: z.number().int(),
  count: z.number().int().nonnegative(),
});
export type ComplimentCountSummary = z.infer<typeof complimentCountSummarySchema>;

export const userComplimentCountsResponseSchema = z.object({
  userId: z.uuid(),
  totals: z.array(complimentCountSummarySchema),
  totalReceived: z.number().int().nonnegative(),
});
export type UserComplimentCountsResponse = z.infer<typeof userComplimentCountsResponseSchema>;
