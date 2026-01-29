import z from 'zod';

export const waveUserDtoSchema = z.object({
  id: z.uuid(),
  gitHubUsername: z.string(),
  gitHubAvatarUrl: z.url(),
});
export type WaveUser = z.infer<typeof waveUserDtoSchema>;

export const waveOwnProfileUserDataSchema = z.object({
  id: z.uuid(),
  gitHubName: z.string().nullable(),
  gitHubAvatarUrl: z.url(),
  gitHubUsername: z.string(),
  email: z.email(),
  payoutAddresses: z
    .object({
      stellar: z.string().nullable(),
    })
    .nullable(),
});

export const newsletterSubscriptionStatusDtoSchema = z.object({
  isSubscribed: z.boolean(),
});
export type NewsletterSubscriptionStatusDto = z.infer<typeof newsletterSubscriptionStatusDtoSchema>;

export const userCodeMetricsDtoSchema = z.object({
  user_id: z.uuid(),
  github_login: z.string(),
  github_created_at: z.coerce.date(),
  metrics_window_start: z.coerce.date(),
  metrics_window_end: z.coerce.date(),
  metrics_baseline_dates: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
  metrics: z.record(
    z.string(),
    z.object({
      value: z.number().nullable(),
      percentile: z.number().nullable(),
      bin: z.string().nullable(),
      lower_is_better: z.boolean(),
      description: z.string(),
    }),
  ),
  lifetime_language_profile: z.array(
    z.object({
      language: z.string(),
      pct: z.number(),
    }),
  ),
  computed_at: z.coerce.date(),
});
export type UserCodeMetricsDto = z.infer<typeof userCodeMetricsDtoSchema>;

export const CODE_METRICS = [
  {
    key: 'total_opened_prs',
    label: 'Total Opened PRs',
    fmt: 'number',
    description: 'Count of PRs opened that received at least one comment or review',
  },
  {
    key: 'total_merged_prs',
    label: 'Total Merged PRs',
    fmt: 'number',
    description: 'Count of PRs that received at least one comment or review and were merged',
  },
  {
    key: 'pr_merge_rate',
    label: 'PR Merge Rate',
    fmt: 'percentage',
    description: 'Percentage of PRs that received at least one comment or review and were merged',
  },
  {
    key: 'pr_drop_rate',
    label: 'PR Drop Rate',
    fmt: 'percentage',
    description:
      'Percentage of PRs that received at least one comment or review and were dropped / closed',
  },
  {
    key: 'avg_merge_latency_hours',
    label: 'Average Merge Latency (hrs)',
    fmt: 'number',
    description: 'Average time taken to merge PRs (in hours)',
  },
  {
    key: 'oss_reviews',
    label: 'Reviews',
    fmt: 'number',
    description: 'Count of reviews in OSS repos',
  },
  {
    key: 'oss_issues_opened',
    label: 'Issues Opened',
    fmt: 'number',
    description: 'Count of issues opened in OSS repos',
  },
  {
    key: 'oss_composite',
    label: 'OSS Activity Score',
    fmt: 'number',
    description: 'Composite metric for overall OSS activity. Considers reviews, PRs, and issues.',
  },
] as const;

// ===========================
// Phone Verification
// ===========================

export const phoneVerificationStatusSchema = z.enum([
  'pending', // Verification code sent, awaiting user input
  'verified', // Phone number successfully verified
  'expired', // Verification code expired
  'failed', // Too many failed attempts
]);
export type PhoneVerificationStatus = z.infer<typeof phoneVerificationStatusSchema>;

export const initiatePhoneVerificationDtoSchema = z.object({
  phoneNumber: z
    .string()
    .min(8)
    .max(20)
    .regex(/^\+[1-9]\d{6,14}$/, {
      message: 'Phone number must be in E.164 format (e.g., +14155552671)',
    }),
});
export type InitiatePhoneVerificationDto = z.infer<typeof initiatePhoneVerificationDtoSchema>;

export const confirmPhoneVerificationDtoSchema = z.object({
  phoneNumber: z
    .string()
    .min(8)
    .max(20)
    .regex(/^\+[1-9]\d{6,14}$/, {
      message: 'Phone number must be in E.164 format (e.g., +14155552671)',
    }),
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, {
      message: 'Code must be a 6-digit number',
    }),
});
export type ConfirmPhoneVerificationDto = z.infer<typeof confirmPhoneVerificationDtoSchema>;

export const phoneVerificationStatusResponseSchema = z.object({
  hasPhoneVerification: z.boolean(),
  status: phoneVerificationStatusSchema.nullable(),
  isVerified: z.boolean(),
  canRetry: z.boolean(),
  attemptsRemaining: z.number().nullable(),
});
export type PhoneVerificationStatusResponse = z.infer<typeof phoneVerificationStatusResponseSchema>;

export const initiatePhoneVerificationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  expiresInSeconds: z.number(),
});
export type InitiatePhoneVerificationResponse = z.infer<
  typeof initiatePhoneVerificationResponseSchema
>;

export const confirmPhoneVerificationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  isVerified: z.boolean(),
  attemptsRemaining: z.number().nullable(),
});
export type ConfirmPhoneVerificationResponse = z.infer<
  typeof confirmPhoneVerificationResponseSchema
>;
