import z, { boolean } from 'zod';
import { waveUserDtoSchema } from './user';
import { filterSchema } from './filter';

export const waveAdminDtoSchema = z.object({
  id: z.uuid(),
  user: waveUserDtoSchema,
  createdAt: z.coerce.date(),
});
export type WaveAdminDto = z.infer<typeof waveAdminDtoSchema>;

export const createWaveProgramDtoSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().min(10).max(5000),
  waveDayOfMonth: z.number().int().min(1).max(31),
  waveDurationDays: z.number().int().min(1).max(365),
  presetBudgetUSD: z.string().regex(/^\d+(\.\d{1,2})?$/),
  avatarUrl: z.url().optional(),
});
export type CreateWaveProgramDto = z.infer<typeof createWaveProgramDtoSchema>;

export const updateWaveProgramDtoSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().min(10).max(5000).optional(),
  paused: z.boolean().optional(),
  waveDayOfMonth: z.number().int().min(1).max(31).optional(),
  waveDurationDays: z.number().int().min(1).max(365).optional(),
  presetBudgetUSD: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  avatarUrl: z.url().nullable().optional(),
});
export type UpdateWaveProgramDto = z.infer<typeof updateWaveProgramDtoSchema>;

export const addWaveAdminDtoSchema = z.object({
  email: z.email(),
});
export type AddWaveAdminDto = z.infer<typeof addWaveAdminDtoSchema>;

export const waveProgramDtoSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  paused: z.boolean(),
  waveDayOfMonth: z.number().int(),
  waveDurationDays: z.number().int(),
  presetBudgetUSD: z.string(),
  avatarUrl: z.url().nullable(),
  slug: z.string(),
  longDescription: z.string().nullable(),

  issueCount: z.number().int(),
  approvedRepoCount: z.number().int(),
  approvedOrgCount: z.number().int(),
  waveCount: z.number().int(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  metadata: z
    .array(
      z.object({
        type: z.enum(['website', 'x']),
        value: z.url(),
      }),
    )
    .nullable(),
});
export type WaveProgramDto = z.infer<typeof waveProgramDtoSchema>;

export const waveProgramFiltersSchema = filterSchema(
  z.object({
    paused: boolean().optional(),
  }),
);
export type WaveProgramFilters = z.infer<typeof waveProgramFiltersSchema>;

// ===========================
// Wave Program Repo Types
// ===========================

export const waveProgramRepoStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type WaveProgramRepoStatus = z.infer<typeof waveProgramRepoStatusSchema>;

export const waveProgramRepoDtoSchema = z.object({
  id: z.uuid(),
  waveProgramId: z.uuid(),
  orgRepoId: z.uuid(),
  status: waveProgramRepoStatusSchema,
  appliedAt: z.coerce.date(),
  appliedByUserId: z.uuid(),
  reviewedAt: z.coerce.date().nullable(),
  reviewedByUserId: z.uuid().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type WaveProgramRepoDto = z.infer<typeof waveProgramRepoDtoSchema>;

export const rejectWaveProgramRepoDtoSchema = z.object({
  rejectionReason: z.string().min(1).max(5000).optional(),
});
export type RejectWaveProgramRepoDto = z.infer<typeof rejectWaveProgramRepoDtoSchema>;

export const waveProgramRepoWithDetailsDtoSchema = z.object({
  id: z.uuid(),
  waveProgramId: z.uuid(),
  status: waveProgramRepoStatusSchema,
  appliedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
  rejectionReason: z.string().nullable(),
  issueCount: z.number().int(),
  repo: z.object({
    id: z.uuid(),
    gitHubRepoName: z.string(),
    gitHubRepoFullName: z.string(),
    gitHubRepoUrl: z.string(),
    description: z.string().nullable(),
    languages: z.record(z.string(), z.number()).nullable(),
  }),
  org: z.object({
    id: z.uuid(),
    gitHubOrgLogin: z.string(),
    gitHubOrgAvatarUrl: z.string().nullable(),
    accountType: z.enum(['User', 'Organization']),
  }),
  appliedBy: waveUserDtoSchema,
  reviewedBy: waveUserDtoSchema.nullable(),
});
export type WaveProgramRepoWithDetailsDto = z.infer<typeof waveProgramRepoWithDetailsDtoSchema>;

export const waveProgramReposFiltersSchema = filterSchema(
  z.object({
    primaryLanguages: z.string().optional(), // comma-separated list of languages
    search: z.string().optional(),
  }),
);
export type WaveProgramReposFilters = z.infer<typeof waveProgramReposFiltersSchema>;

// ===========================
// Wave Program Issue Types
// ===========================

export const complexitySchema = z.enum(['small', 'medium', 'large']);
export type Complexity = z.infer<typeof complexitySchema>;

export const waveProgramIssueWithDetailsDtoSchema = z.object({
  id: z.uuid(),
  addedAt: z.coerce.date(),
  removedAt: z.coerce.date().nullable(),
  issue: z.object({
    id: z.uuid(),
    gitHubIssueNumber: z.number(),
    title: z.string(),
    body: z.string().nullable(),
    state: z.string(),
    gitHubAuthorLogin: z.string().nullable(),
    gitHubCreatedAt: z.coerce.date(),
    gitHubUpdatedAt: z.coerce.date(),
    gitHubClosedAt: z.coerce.date().nullable(),
    repo: z.object({
      id: z.uuid(),
      gitHubRepoName: z.string(),
      gitHubRepoFullName: z.string(),
      gitHubRepoUrl: z.string(),
    }),
  }),
  addedBy: waveUserDtoSchema.nullable(),
  removedBy: waveUserDtoSchema.nullable(),
});

// ===========================
// Wave Types
// ===========================

export const waveStatusSchema = z.enum(['upcoming', 'active', 'ended']);

export const waveFiltersSchema = filterSchema(
  z.object({
    status: waveStatusSchema.optional(),
  }),
);
export type WaveFilters = z.infer<typeof waveFiltersSchema>;

export const waveDtoSchema = z.object({
  id: z.uuid(),
  waveProgramId: z.uuid(),
  waveNumber: z.number().int(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  budgetUSD: z.coerce.number(),
  status: waveStatusSchema,
  createdAt: z.coerce.date(),
});
export type WaveDto = z.infer<typeof waveDtoSchema>;
