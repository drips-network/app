import z from 'zod';

export const reviewerRoleSchema = z.enum(['maintainer', 'contributor']);
export type ReviewerRole = z.infer<typeof reviewerRoleSchema>;

export const overallExperienceSchema = z.enum([
  'below_expectations',
  'alright',
  'exceeded_expectations',
]);
export type OverallExperience = z.infer<typeof overallExperienceSchema>;

const ratingSchema = z.number().int().min(1).max(5);

const reviewMetaSchema = z.object({
  id: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

const optionalRating = ratingSchema.nullish();

export const maintainerReviewPayloadSchema = z.object({
  reviewerRole: z.literal('maintainer'),
  overallExperience: overallExperienceSchema,
  communicationQuality: optionalRating,
  codeQuality: optionalRating,
  timeliness: optionalRating,
  problemSolving: optionalRating,
  comment: z.string().max(5000).nullish(),
});
export type MaintainerReviewPayload = z.infer<typeof maintainerReviewPayloadSchema>;

export const contributorReviewPayloadSchema = z.object({
  reviewerRole: z.literal('contributor'),
  overallExperience: overallExperienceSchema,
  communicationQuality: optionalRating,
  issueClarity: optionalRating,
  repoCodeQuality: optionalRating,
  timeliness: optionalRating,
  comment: z.string().max(5000).nullish(),
});
export type ContributorReviewPayload = z.infer<typeof contributorReviewPayloadSchema>;

export const reviewPayloadSchema = z.discriminatedUnion('reviewerRole', [
  maintainerReviewPayloadSchema,
  contributorReviewPayloadSchema,
]);
export type ReviewPayload = z.infer<typeof reviewPayloadSchema>;

export const maintainerReviewDtoSchema = reviewMetaSchema.merge(maintainerReviewPayloadSchema);
export const contributorReviewDtoSchema = reviewMetaSchema.merge(contributorReviewPayloadSchema);

export const reviewDtoSchema = z.discriminatedUnion('reviewerRole', [
  maintainerReviewDtoSchema.passthrough(),
  contributorReviewDtoSchema.passthrough(),
]);
export type ReviewDto = z.infer<typeof reviewDtoSchema>;
