import z from 'zod';

export const waveReportStatusSchema = z.enum([
  'pending',
  'completed',
  'insufficient_data',
  'failed',
]);
export type WaveReportStatus = z.infer<typeof waveReportStatusSchema>;

export const waveReportStatsSchema = z.object({
  version: z.literal(1),
  totals: z.object({
    pointsEarned: z.number(),
    issuesResolved: z.number(),
    applicationsSubmitted: z.number(),
  }),
  ratings: z.object({
    averages: z.object({
      communicationQuality: z.number().nullable(),
      codeQuality: z.number().nullable(),
      timeliness: z.number().nullable(),
      problemSolving: z.number().nullable(),
    }),
    reviewCount: z.number(),
    overallExperience: z.object({
      belowExpectations: z.number(),
      alright: z.number(),
      exceededExpectations: z.number(),
    }),
  }),
  histograms: z.object({
    /** One entry per UTC calendar day of the wave, zero-filled. Date format YYYY-MM-DD. */
    applicationsPerDay: z.array(z.object({ date: z.string(), count: z.number() })),
    pointsPerDay: z.array(z.object({ date: z.string(), points: z.number() })),
  }),
  waveOverWave: z.object({
    previousWaveId: z.uuid().nullable(),
    previousWaveNumber: z.number().nullable(),
    pointsEarnedPctChange: z.number().nullable(),
    issuesResolvedPctChange: z.number().nullable(),
    applicationsSubmittedPctChange: z.number().nullable(),
  }),
});
export type WaveReportStats = z.infer<typeof waveReportStatsSchema>;

export const waveReportAiSummarySchema = z.object({
  version: z.literal(1),
  summary: z.string(),
  strengths: z.array(z.string()),
  growthAreas: z.array(z.string()),
});
export type WaveReportAiSummary = z.infer<typeof waveReportAiSummarySchema>;

export const waveReportListItemDtoSchema = z.object({
  id: z.uuid(),
  waveId: z.uuid(),
  waveNumber: z.number().int(),
  waveProgramId: z.uuid(),
  waveProgramName: z.string(),
  waveProgramSlug: z.string(),
  waveStartDate: z.coerce.date(),
  waveEndDate: z.coerce.date(),
  status: waveReportStatusSchema,
  generatedAt: z.coerce.date().nullable(),
});
export type WaveReportListItemDto = z.infer<typeof waveReportListItemDtoSchema>;

export const waveReportsResponseSchema = z.object({
  reports: z.array(waveReportListItemDtoSchema),
});
export type WaveReportsResponse = z.infer<typeof waveReportsResponseSchema>;

export const waveReportDtoSchema = z.object({
  id: z.uuid(),
  waveId: z.uuid(),
  waveNumber: z.number().int(),
  waveProgramId: z.uuid(),
  waveProgramName: z.string(),
  waveProgramSlug: z.string(),
  waveStartDate: z.coerce.date(),
  waveEndDate: z.coerce.date(),
  status: waveReportStatusSchema,
  stats: waveReportStatsSchema.nullable(),
  aiSummary: waveReportAiSummarySchema.nullable(),
  generatedAt: z.coerce.date().nullable(),
});
export type WaveReportDto = z.infer<typeof waveReportDtoSchema>;

// ===========================
// Org wave reports
// ===========================

export const orgWaveReportStatsSchema = z.object({
  version: z.literal(1),
  totals: z.object({
    pointsAwarded: z.number(),
    issuesCompleted: z.number(),
    applicationsReceived: z.number(),
    uniqueContributors: z.number(),
  }),
  ratings: z.object({
    averages: z.object({
      communicationQuality: z.number().nullable(),
      repoCodeQuality: z.number().nullable(),
      issueClarity: z.number().nullable(),
      timeliness: z.number().nullable(),
    }),
    reviewCount: z.number(),
    overallExperience: z.object({
      belowExpectations: z.number(),
      alright: z.number(),
      exceededExpectations: z.number(),
    }),
  }),
  histograms: z.object({
    applicationsPerDay: z.array(z.object({ date: z.string(), count: z.number() })),
    pointsPerDay: z.array(z.object({ date: z.string(), points: z.number() })),
  }),
  waveOverWave: z.object({
    previousWaveId: z.uuid().nullable(),
    previousWaveNumber: z.number().nullable(),
    pointsAwardedPctChange: z.number().nullable(),
    issuesCompletedPctChange: z.number().nullable(),
    applicationsReceivedPctChange: z.number().nullable(),
  }),
});
export type OrgWaveReportStats = z.infer<typeof orgWaveReportStatsSchema>;

export const orgWaveReportDtoSchema = z.object({
  id: z.uuid(),
  status: waveReportStatusSchema,
  stats: orgWaveReportStatsSchema.nullable(),
  aiSummary: waveReportAiSummarySchema.nullable(),
  generatedAt: z.coerce.date().nullable(),
});
export type OrgWaveReportDto = z.infer<typeof orgWaveReportDtoSchema>;

export const orgWaveReportsResponseSchema = z.object({
  reports: z.array(
    z.object({
      org: z.object({
        id: z.uuid(),
        gitHubOrgLogin: z.string(),
        gitHubOrgName: z.string().nullable(),
        gitHubOrgAvatarUrl: z.string().nullable(),
      }),
      report: orgWaveReportDtoSchema.nullable(),
    }),
  ),
});
export type OrgWaveReportsResponse = z.infer<typeof orgWaveReportsResponseSchema>;
export type OrgWaveReportEntry = OrgWaveReportsResponse['reports'][number];
