import z from 'zod';
import { filterSchema } from './filter';
import { linkedAccountSchema } from './user';
import { orgContactInfoSchema } from './waveProgram';

export const orgDtoSchema = z.object({
  id: z.uuid(),
  gitHubInstallationId: z.number(),
  gitHubOrgId: z.number(),
  gitHubOrgLogin: z.string(),
  gitHubOrgName: z.string().nullable(),
  gitHubOrgAvatarUrl: z.string().nullable(),
  accountType: z.string(),
  repositorySelection: z.string().nullable(),
  suspendedAt: z.coerce.date().nullable(),
  uninstalledAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Org = z.infer<typeof orgDtoSchema>;

export const orgFiltersSchema = filterSchema(
  z.object({
    gitHubOrgLogin: z.string().optional(),
    gitHubInstallationId: z.string().optional(),
  }),
);
export type OrgFilters = z.infer<typeof orgFiltersSchema>;

export const userOrgDtoSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  orgId: z.uuid(),
  gitHubRole: z.string().nullable(),
  lastSyncedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  org: orgDtoSchema,
});

export const publicOrgDtoSchema = z.object({
  id: z.uuid(),
  gitHubOrgId: z.number(),
  gitHubOrgLogin: z.string(),
  gitHubOrgName: z.string().nullable(),
  gitHubOrgAvatarUrl: z.string().nullable(),
  accountType: z.string(),
  approvedRepoCount: z.number().int(),
  createdAt: z.coerce.date(),
  contactInfo: orgContactInfoSchema.nullable(),
});
export type PublicOrgDto = z.infer<typeof publicOrgDtoSchema>;

export const publicOrgsFiltersSchema = filterSchema(
  z.object({
    search: z.string().optional(),
  }),
);
export type PublicOrgsFilters = z.infer<typeof publicOrgsFiltersSchema>;

export const orgMemberDtoSchema = z.object({
  id: z.uuid(),
  gitHubUsername: z.string(),
  gitHubName: z.string().nullable(),
  gitHubAvatarUrl: z.string().nullable(),
  linkedAccounts: z.array(linkedAccountSchema),
});
export type OrgMemberDto = z.infer<typeof orgMemberDtoSchema>;

export const orgRepoDtoSchema = z.object({
  id: z.uuid(),
  orgId: z.uuid(),
  gitHubRepoId: z.number(),
  gitHubRepoName: z.string(),
  gitHubRepoFullName: z.string(),
  gitHubRepoUrl: z.string(),
  description: z.string().nullable(),
  defaultBranch: z.string().nullable(),
  isArchived: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
