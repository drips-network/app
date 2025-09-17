import { z } from 'zod';

/**
 * Zod schema for validating the response from the ORCID Public API v3.0.
 * This schema covers the main sections of an ORCID record, including
 * personal details and activity summaries. It can be extended to cover
 * more specific fields as needed.
 *
 */

// --- Reusable Common Schemas ---

const StringValueSchema = z.object({
  value: z.string().nullable(),
});

const TimestampSchema = z.object({
  value: z.number(),
});

// const VisibilitySchema = z.enum(['PUBLIC', 'LIMITED', 'PRIVATE']);

const OrcidIdentifierSchema = z.object({
  uri: z.string().url(),
  path: z.string(), // This is the actual ORCID iD
  host: z.string(),
});

// const SourceSchema = z.object({
//   'source-orcid': OrcidIdentifierSchema.nullable(),
//   'source-client-id': z.unknown().nullable(),
//   'source-name': StringValueSchema.nullable(),
// });

// --- Person Details ---

const NameSchema = z.object({
  'given-names': StringValueSchema.nullable(),
  'family-name': StringValueSchema.nullable(),
  'credit-name': StringValueSchema.nullable(),
  // source: SourceSchema.nullable(),
  // visibility: VisibilitySchema,
  // path: z.string(),
});

const BiographySchema = z.object({
  content: z.string(),
  // visibility: VisibilitySchema,
  // path: z.string(),
  'created-date': TimestampSchema,
  'last-modified-date': TimestampSchema,
});

const OtherNameSchema = z.object({
  content: z.string(),
  // visibility: VisibilitySchema,
  // path: z.string(),
  // 'put-code': z.number(),
  // 'display-index': z.number(),
  // source: SourceSchema,
  'created-date': TimestampSchema,
  'last-modified-date': TimestampSchema,
});

const ResearcherUrlSchema = z.object({
  'url-name': z.string().nullable(),
  url: StringValueSchema,
  // visibility: VisibilitySchema,
  // path: z.string(),
  // 'put-code': z.number(),
  // 'display-index': z.number(),
  // source: SourceSchema,
  'created-date': TimestampSchema,
  'last-modified-date': TimestampSchema,
});

// const KeywordSchema = z.object({
//   content: z.string(),
//   visibility: VisibilitySchema,
//   path: z.string(),
//   'put-code': z.number(),
//   'display-index': z.number(),
//   source: SourceSchema,
//   'created-date': TimestampSchema,
//   'last-modified-date': TimestampSchema,
// });

// const EmailSchema = z.object({
//   email: z.string().email(),
//   path: z.string(),
//   visibility: VisibilitySchema,
//   verified: z.boolean(),
//   primary: z.boolean(),
//   'put-code': z.number().nullable(),
//   source: SourceSchema,
//   'created-date': TimestampSchema,
//   'last-modified-date': TimestampSchema,
// });

const PersonSchema = z.object({
  'last-modified-date': TimestampSchema.nullable(),
  name: NameSchema,
  biography: BiographySchema.nullable(),
  'researcher-urls': z.object({ 'researcher-url': z.array(ResearcherUrlSchema) }).nullable(),
  // emails: z.object({ email: z.array(EmailSchema) }).nullable(),
  'other-names': z.object({ 'other-name': z.array(OtherNameSchema) }).nullable(),
  // keywords: z.object({ keyword: z.array(KeywordSchema) }).nullable(),
  // path: z.string(),
});

// --- Activity Summaries (Works, Employments, etc.) ---

// A generic schema for a summary item (like a single job or publication)
// const ActivitySummarySchema = z.object({
//   'created-date': TimestampSchema,
//   'last-modified-date': TimestampSchema,
//   source: SourceSchema,
//   'put-code': z.number(),
//   'path': z.string(),
//   'visibility': VisibilitySchema,
//   'display-index': z.string(),
// });

// const WorkTitleSchema = z.object({
//   title: StringValueSchema,
//   subtitle: StringValueSchema.nullable(),
// });

// const WorkSummarySchema = ActivitySummarySchema.extend({
//   type: z.string(),
//   'journal-title': StringValueSchema.nullable(),
//   title: WorkTitleSchema,
// });

//

// const AffiliationSummarySchema = ActivitySummarySchema.extend({
//   'department-name': z.string().nullable(),
//   'role-title': z.string().nullable(),
//   'start-date': z.unknown().nullable(), // Date structure is complex
//   'end-date': z.unknown().nullable(),
//   organization: OrganizationSchema,
// });

// const ActivitiesSummarySchema = z.object({
//   'last-modified-date': TimestampSchema,
//   // Note the nested structure for affiliations and works
//   educations: z.object({
//     'affiliation-group': z.array(z.object({ summaries: z.array(AffiliationSummarySchema) })),
//   }),
//   employments: z.object({
//     'affiliation-group': z.array(z.object({ summaries: z.array(AffiliationSummarySchema) })),
//   }),
//   works: z.object({
//     group: z.array(z.object({ 'work-summary': z.array(WorkSummarySchema) })),
//   }),
//   path: z.string(),
//   // Other sections like 'fundings', 'peer-reviews' can be added here.
// });

// --- Main Schema for the Entire API Response ---

export const OrcidApiResponseSchema = z.object({
  'orcid-identifier': OrcidIdentifierSchema,
  person: PersonSchema,
  // 'activities-summary': ActivitiesSummarySchema,
  // 'last-modified-date': TimestampSchema,
  // path: z.string(),
});

// You can infer a TypeScript type directly from the schema
export type OrcidApiResponse = z.infer<typeof OrcidApiResponseSchema>;
