import z from 'zod';
import { waveUserDtoSchema } from './user';
import { filterSchema } from './filter';
import { repoDtoSchema } from './repo';
import { complexitySchema, waveDtoSchema } from './waveProgram';

export const assignedApplicantDtoSchema = waveUserDtoSchema.extend({
  waveProgramId: z.uuid(),
  dueDate: z.coerce.date(),
});
export type AssignedApplicantDto = z.infer<typeof assignedApplicantDtoSchema>;

const booleanString = z.union([z.boolean(), z.literal('true'), z.literal('false')]);

export const issueFilters = filterSchema(
  z.object({
    orgId: z.uuid().optional(),
    repoId: z.uuid().optional(),
    waveProgramId: z.uuid().optional(),
    state: z.enum(['open', 'closed']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    mine: booleanString.optional(),
    applicantAssigned: booleanString.optional(),
    isInWaveProgram: booleanString.optional(),
    assignedToUser: z.uuid().optional(),
    appliedToByUser: z.uuid().optional(),
    resolvedByUserId: z.uuid().optional(),
    eligibleForWaveProgram: booleanString.optional(),
    hasApplications: booleanString.optional(),
    hasPr: booleanString.optional(),
    search: z.string().optional(),
  }),
);
export type IssueFilters = z.infer<typeof issueFilters>;

export const issueSortByOptionsSchema = z.enum(['createdAt', 'updatedAt', 'points']);
export type IssueSortByOption = z.infer<typeof issueSortByOptionsSchema>;

export const issueDetailsDtoSchema = z.object({
  id: z.uuid(),
  gitHubIssueId: z.number(),
  gitHubIssueNumber: z.number(),
  title: z.string(),
  body: z.string().nullable(),
  state: z.string(),
  gitHubAuthorId: z.number().nullable(),
  gitHubAuthorLogin: z.string().nullable(),
  assignees: z.array(z.any()),
  labels: z.array(z.any()),
  gitHubCreatedAt: z.coerce.date(),
  gitHubUpdatedAt: z.coerce.date(),
  gitHubClosedAt: z.coerce.date().nullable(),
  repo: repoDtoSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  waveProgramId: z.uuid().nullable(),
  complexity: complexitySchema.nullable(),
  points: z.number().int().nullable(),
  pointsMultiplier: z.number().int().optional(),
  pointsEarned: z.number().int().nullable().optional(),
  pendingApplicationsCount: z.number().int().min(0),
  assignedApplicant: assignedApplicantDtoSchema.nullable(),
  resolvedInWave: waveDtoSchema.nullable(),
  hasPr: z.boolean(),
});
export type IssueDetailsDto = z.infer<typeof issueDetailsDtoSchema>;
