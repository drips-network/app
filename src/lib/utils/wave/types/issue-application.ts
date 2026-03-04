import z from 'zod';
import { waveUserDtoSchema } from './user';
import { filterSchema } from './filter';

export const issueApplicationStatusSchema = z.enum([
  'pending',
  'accepted',
  'rejected',
  'withdrawn',
  'unassigned',
]);
export type IssueApplicationStatus = z.infer<typeof issueApplicationStatusSchema>;

export const submitIssueApplicationDtoSchema = z.object({
  applicationText: z.string().min(10).max(2000),
});
export type SubmitIssueApplicationDto = z.infer<typeof submitIssueApplicationDtoSchema>;

export const issueApplicationDtoSchema = z.object({
  id: z.uuid(),
  waveIssueId: z.uuid(),
  userId: z.uuid(),
  applicationText: z.string(),
  status: issueApplicationStatusSchema,
  appliedAt: z.coerce.date(),
  waveId: z.uuid(),
  reviewedAt: z.coerce.date().nullable(),
  reviewedByUserId: z.uuid().nullable(),
  removedAt: z.coerce.date().nullable(),
  removedByUserId: z.uuid().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type IssueApplicationDto = z.infer<typeof issueApplicationDtoSchema>;

export const issueApplicationWithDetailsDtoSchema = z.object({
  id: z.uuid(),
  applicationText: z.string(),
  status: issueApplicationStatusSchema,
  appliedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
  removedAt: z.coerce.date().nullable(),
  applicant: waveUserDtoSchema.extend({
    verified: z.boolean(),
    currentWaveApplicationCount: z.number().int().min(0).nullable(),
    currentWaveAssignmentCount: z.number().int().min(0).nullable(),
    currentWavePointsEarned: z.number().int().min(0).nullable(),
    currentWaveIssuesResolved: z.number().int().min(0).nullable(),
    currentWaveSameOrgQuotaRemaining: z.number().int().min(0).nullable(),
  }),
  removedBy: waveUserDtoSchema.nullable(),
  reviewedBy: waveUserDtoSchema.nullable(),
});
export type IssueApplicationWithDetailsDto = z.infer<typeof issueApplicationWithDetailsDtoSchema>;

export const applicationQuotaDtoSchema = z.object({
  used: z.number().int().min(0),
  limit: z.number().int().min(0),
  remaining: z.number().int().min(0),
});
export type ApplicationQuotaDto = z.infer<typeof applicationQuotaDtoSchema>;

export const issueApplicationFiltersSchema = filterSchema(
  z.object({
    includeRemoved: z.boolean().optional(),
    status: issueApplicationStatusSchema.optional(),
    statusNot: issueApplicationStatusSchema.optional(),
    waveId: z.union([z.uuid(), z.literal('current')]).optional(),
    applicantId: z.uuid().optional(),
  }),
);
export type IssueApplicationFilters = z.infer<typeof issueApplicationFiltersSchema>;
