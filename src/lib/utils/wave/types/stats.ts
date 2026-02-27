import z from 'zod';

// ====== Points Stats ======

export const contributorWavePointsSchema = z.object({
  waveId: z.string(),
  waveNumber: z.number().int(),
  waveProgramId: z.string(),
  waveProgramName: z.string(),
  waveProgramSlug: z.string(),
  points: z.number().int(),
});

export const contributorPointsStatsSchema = z.object({
  totalAllTime: z.number().int(),
  byWave: z.array(contributorWavePointsSchema),
});

// ====== Issue Stats ======

export const contributorIssueStatsSchema = z.object({
  totalResolved: z.number().int(),
  byComplexity: z.object({
    small: z.number().int(),
    medium: z.number().int(),
    large: z.number().int(),
    unset: z.number().int(),
  }),
});

// ====== Leaderboard Stats ======

export const contributorLeaderboardWaveEntrySchema = z.object({
  waveId: z.string(),
  waveNumber: z.number().int(),
  rank: z.number().int(),
  totalParticipants: z.number().int(),
  points: z.number().int(),
});

export const contributorLeaderboardProgramSchema = z.object({
  waveProgramId: z.string(),
  waveProgramName: z.string(),
  waveProgramSlug: z.string(),
  waves: z.array(contributorLeaderboardWaveEntrySchema),
});

export const contributorLeaderboardStatsSchema = z.object({
  byProgram: z.array(contributorLeaderboardProgramSchema),
});

// ====== Review Stats ======

export const contributorReviewStatsSchema = z.object({
  totalReceived: z.number().int(),
  experienceDistribution: z.object({
    exceededExpectations: z.number().int(),
    alright: z.number().int(),
    belowExpectations: z.number().int(),
  }),
  averageRatings: z.object({
    communicationQuality: z.number().nullable(),
    codeQuality: z.number().nullable(),
    timeliness: z.number().nullable(),
    problemSolving: z.number().nullable(),
  }),
});

// ====== Combined Response ======

export const contributorStatsResponseSchema = z.object({
  points: contributorPointsStatsSchema,
  issues: contributorIssueStatsSchema,
  leaderboard: contributorLeaderboardStatsSchema,
  reviews: contributorReviewStatsSchema.nullable(),
});
export type ContributorStatsResponse = z.infer<typeof contributorStatsResponseSchema>;

// ====== AI Summary Response ======

export const contributorAiSummaryResponseSchema = z.object({
  summary: z.string().nullable(),
  generatedAt: z.string().nullable(),
  reviewCount: z.number().int().nullable(),
});
export type ContributorAiSummaryResponse = z.infer<typeof contributorAiSummaryResponseSchema>;
