import z from 'zod';
import { waveUserDtoSchema } from './user';
import { filterSchema } from './filter';

export const assignedApplicantDtoSchema = waveUserDtoSchema.extend({
  waveId: z.uuid(),
});
export type AssignedApplicantDto = z.infer<typeof assignedApplicantDtoSchema>;

export const issueFilters = filterSchema(
  z.object({
    orgId: z.uuid().optional(),
    repoId: z.uuid().optional(),
    waveId: z.uuid().optional(),
    state: z.enum(['open', 'closed']).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
);
export type IssueFilters = z.infer<typeof issueFilters>;

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
  repo: z.object({
    id: z.uuid(),
    gitHubRepoName: z.string(),
    gitHubRepoFullName: z.string(),
    gitHubRepoUrl: z.string(),
    org: z.object({
      id: z.uuid(),
      gitHubOrgLogin: z.string(),
      gitHubOrgName: z.string().nullable(),
    }),
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  waveId: z.uuid().nullable(),
  pendingApplicationsCount: z.number().int().min(0),
  assignedApplicant: assignedApplicantDtoSchema.nullable(),
});
export type IssueDetailsDto = z.infer<typeof issueDetailsDtoSchema>;
