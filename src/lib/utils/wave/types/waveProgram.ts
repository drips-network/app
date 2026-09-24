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
  repoPointsBudget: z.number().int().nullable(),
  orgPointsBudget: z.number().int().nullable(),
  repoApplicationsLimitPerUser: z.number().int().nullable(),
  repoApplicationsLimitPerOrg: z.number().int().nullable(),
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
// Repo Tag Types
// ===========================

export const repoTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  imageUrl: z.string().nullable().optional(),
});
export type RepoTag = z.infer<typeof repoTagSchema>;

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  imageUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Tag = z.infer<typeof tagSchema>;

// ===========================
// Wave Program Repo Types
// ===========================

export const waveProgramRepoStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type WaveProgramRepoStatus = z.infer<typeof waveProgramRepoStatusSchema>;

export const repoRejectionAppealStatusSchema = z.enum(['pending', 'dismissed']);
export type RepoRejectionAppealStatus = z.infer<typeof repoRejectionAppealStatusSchema>;

export const repoRejectionAppealResolutionSchema = z.enum([
  'admin_dismissed',
  'auto_repo_approved',
  'auto_repo_reapplied',
]);
export type RepoRejectionAppealResolution = z.infer<typeof repoRejectionAppealResolutionSchema>;

// Appeal eligibility for a rejected repo application, surfaced on the maintainer
// dashboard so it can render the "Appeal" button state without extra calls.
export const repoAppealEligibilitySchema = z.object({
  canAppeal: z.boolean(),
  latestAppealStatus: repoRejectionAppealStatusSchema.nullable(),
  latestAppealAt: z.coerce.date().nullable(),
  nextAppealAllowedAt: z.coerce.date().nullable(),
  appealCount: z.number().int(),
  appealsRemaining: z.number().int(),
});
export type RepoAppealEligibility = z.infer<typeof repoAppealEligibilitySchema>;

export const waveProgramRepoDtoSchema = z.object({
  id: z.uuid(),
  waveProgramId: z.uuid(),
  orgRepoId: z.uuid(),
  status: waveProgramRepoStatusSchema,
  appliedAt: z.coerce.date(),
  appliedByUserId: z.uuid(),
  reviewedAt: z.coerce.date().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type WaveProgramRepoDto = z.infer<typeof waveProgramRepoDtoSchema>;

export const rejectWaveProgramRepoDtoSchema = z.object({
  rejectionReason: z.string().min(1).max(5000).optional(),
});
export type RejectWaveProgramRepoDto = z.infer<typeof rejectWaveProgramRepoDtoSchema>;

// Appeal questionnaire. Mirrors the backend's extensible jsonb form_data — add
// fields here as the appeal form grows.
export const appealWaveProgramRepoFormDataSchema = z.object({
  developmentWorkSinceRejection: z.string().min(1).max(10000),
});
export type AppealWaveProgramRepoFormData = z.infer<typeof appealWaveProgramRepoFormDataSchema>;

export const repoRejectionAppealDtoSchema = z.object({
  id: z.uuid(),
  waveProgramRepoId: z.uuid(),
  formData: appealWaveProgramRepoFormDataSchema,
  status: repoRejectionAppealStatusSchema,
  resolution: repoRejectionAppealResolutionSchema.nullable(),
  createdAt: z.coerce.date(),
  resolvedAt: z.coerce.date().nullable(),
});
export type RepoRejectionAppealDto = z.infer<typeof repoRejectionAppealDtoSchema>;

// Context for the standalone appeal flow's entrypoint (single application).
export const repoAppealContextDtoSchema = z.object({
  waveProgramId: z.uuid(),
  orgRepoId: z.uuid(),
  status: waveProgramRepoStatusSchema,
  repo: z.object({
    id: z.uuid(),
    gitHubRepoFullName: z.string(),
    gitHubRepoUrl: z.string(),
  }),
  appeal: repoAppealEligibilitySchema,
});
export type RepoAppealContextDto = z.infer<typeof repoAppealContextDtoSchema>;

export const waveProgramRepoWithDetailsDtoSchema = z.object({
  id: z.uuid(),
  waveProgramId: z.uuid(),
  status: waveProgramRepoStatusSchema,
  appliedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
  rejectionReason: z.string().nullable(),
  issueCount: z.number().int(),
  pointsUsed: z.number().int(),
  pointsBudget: z.number().int().nullable(),
  pointsRemaining: z.number().int().nullable(),
  pointsBudgetOverride: z.number().int().nullable().optional(),
  orgPointsUsed: z.number().int().optional(),
  orgPointsBudget: z.number().int().nullable().optional(),
  orgPointsRemaining: z.number().int().nullable().optional(),
  userApplicationsUsed: z.number().int().optional(),
  userApplicationsLimit: z.number().int().nullable().optional(),
  userApplicationsRemaining: z.number().int().nullable().optional(),
  orgApplicationsUsed: z.number().int().optional(),
  orgApplicationsLimit: z.number().int().nullable().optional(),
  orgApplicationsRemaining: z.number().int().nullable().optional(),
  pointsMultiplier: z.number().int().optional(),
  repo: z.object({
    stargazersCount: z.number().int().nullable().optional(),
    forksCount: z.number().int().nullable().optional(),
    id: z.uuid(),
    gitHubRepoName: z.string(),
    gitHubRepoFullName: z.string(),
    gitHubRepoUrl: z.string(),
    description: z.string().nullable(),
    languages: z.record(z.string(), z.number()).nullable(),
    tags: z.array(repoTagSchema).optional(),
  }),
  org: z.object({
    id: z.uuid(),
    gitHubOrgLogin: z.string(),
    gitHubOrgAvatarUrl: z.string().nullable(),
    accountType: z.enum(['User', 'Organization']),
  }),
  appliedBy: waveUserDtoSchema,
  // Present only on the maintainer's own repo listing (/api/wave-program-repos).
  appeal: repoAppealEligibilitySchema.optional(),
});
export type WaveProgramRepoWithDetailsDto = z.infer<typeof waveProgramRepoWithDetailsDtoSchema>;

// ===========================
// Batch Apply Types
// ===========================

export const previousParticipationSchema = z.enum([
  'previous_wave',
  'onlydust_stellar_missions',
  'stellar_community_fund',
  'stellar_hackathon',
  'other_stellar_ecosystem_program',
]);
export type PreviousParticipation = z.infer<typeof previousParticipationSchema>;

export const batchApplyFormDataSchema = z.object({
  previousParticipation: z.array(previousParticipationSchema),
  plannedIssuesDescription: z.string().min(1).max(5000),
  repoRelationshipDescription: z.string().min(1).max(5000).optional(),
  upstreamRelationshipDescription: z.string().min(1).max(5000).optional(),
  forkJustification: z.string().min(1).max(5000).optional(),
  supportingLinks: z.array(z.string()).optional(),
});
export type BatchApplyFormData = z.infer<typeof batchApplyFormDataSchema>;

export const batchApplyRequestSchema = z.object({
  orgRepoIds: z.array(z.uuid()).min(1).max(50),
  formData: batchApplyFormDataSchema,
});
export type BatchApplyRequest = z.infer<typeof batchApplyRequestSchema>;

export const batchApplyResponseSchema = z.object({
  formAnswers: z.object({
    id: z.uuid(),
    waveProgramId: z.uuid(),
    userId: z.uuid(),
    formData: batchApplyFormDataSchema,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
  results: z.array(waveProgramRepoWithDetailsDtoSchema),
});
export type BatchApplyResponse = z.infer<typeof batchApplyResponseSchema>;

export const waveProgramReposSortBySchema = z.enum(['stargazersCount', 'forksCount', 'issueCount']);
export type WaveProgramReposSortBy = z.infer<typeof waveProgramReposSortBySchema>;

export const waveProgramReposFiltersSchema = filterSchema(
  z.object({
    primaryLanguages: z.string().optional(), // comma-separated list of languages
    search: z.string().optional(),
    sortBy: waveProgramReposSortBySchema.optional(),
    orgId: z.uuid().optional(),
    tagId: z.string().optional(), // comma-separated list of tag UUIDs
  }),
);
export type WaveProgramReposFilters = z.infer<typeof waveProgramReposFiltersSchema>;

// ===========================
// Wave Program Org Types
// ===========================

export const orgContactInfoSchema = z.object({
  email: z.string().nullable(),
  description: z.string().nullable(),
  url: z.string().nullable(),
  location: z.string().nullable(),
  socialLinks: z.array(
    z.object({
      provider: z.string(),
      url: z.string(),
    }),
  ),
});

export const waveProgramOrgDtoSchema = z.object({
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
export type WaveProgramOrgDto = z.infer<typeof waveProgramOrgDtoSchema>;

export const waveProgramOrgFilterOptionDtoSchema = z.object({
  id: z.uuid(),
  gitHubOrgLogin: z.string(),
  gitHubOrgName: z.string().nullable(),
  gitHubOrgAvatarUrl: z.string().nullable(),
  approvedRepoCount: z.number().int(),
});
export type WaveProgramOrgFilterOptionDto = z.infer<typeof waveProgramOrgFilterOptionDtoSchema>;

export const waveProgramOrgFilterOptionsResponseDtoSchema = z.object({
  data: z.array(waveProgramOrgFilterOptionDtoSchema),
});

export const waveProgramOrgsFiltersSchema = filterSchema(
  z.object({
    search: z.string().optional(),
  }),
);
export type WaveProgramOrgsFilters = z.infer<typeof waveProgramOrgsFiltersSchema>;

// ===========================
// Wave Program Issue Types
// ===========================

export const complexitySchema = z.enum(['small', 'medium', 'large']);
export type Complexity = z.infer<typeof complexitySchema>;

export const waveProgramIssueWithDetailsDtoSchema = z.object({
  id: z.uuid(),
  addedAt: z.coerce.date(),
  removedAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  pointsMultiplier: z.number().int().optional(),
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

export const bulkAddIssueResultDtoSchema = z.object({
  issueId: z.uuid(),
  success: z.boolean(),
  waveProgramIssue: waveProgramIssueWithDetailsDtoSchema.nullable(),
  error: z.string().nullable(),
});
export type BulkAddIssueResultDto = z.infer<typeof bulkAddIssueResultDtoSchema>;

export const bulkAddIssuesToWaveProgramResponseDtoSchema = z.object({
  results: z.array(bulkAddIssueResultDtoSchema),
  addedCount: z.number().int(),
  failedCount: z.number().int(),
});
export type BulkAddIssuesToWaveProgramResponseDto = z.infer<
  typeof bulkAddIssuesToWaveProgramResponseDtoSchema
>;

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

// ===========================
// Repo Application Limits
// ===========================

export const applicationLimitStatusSchema = z.object({
  /** Applications counted toward the current wave cycle. */
  used: z.number().int(),
  /** Configured limit (null = unlimited). */
  limit: z.number().int().nullable(),
  /** Remaining slots (null = unlimited, can be negative if the limit was lowered). */
  remaining: z.number().int().nullable(),
});
export type ApplicationLimitStatus = z.infer<typeof applicationLimitStatusSchema>;

export const waveProgramApplicationLimitsDtoSchema = z.object({
  /** Calling user's repo-application usage for the current wave cycle. */
  perUser: applicationLimitStatusSchema,
  /** Per-org usage for every org the calling user belongs to. */
  perOrg: z.array(applicationLimitStatusSchema.extend({ orgId: z.uuid() })),
});
export type WaveProgramApplicationLimitsDto = z.infer<typeof waveProgramApplicationLimitsDtoSchema>;
