import { z } from 'zod';

/**
 * Zod schema for validating the response from the ORCID Public API v3.0.
 * This schema covers the main sections of an ORCID record that
 * we are interested in for the frontend application.
 */

const StringValueSchema = z.object({
  value: z.string().nullable(),
});

const TimestampSchema = z.object({
  value: z.number(),
});

const OrcidIdentifierSchema = z.object({
  uri: z.string().url(),
  path: z.string(), // This is the actual ORCID iD
  host: z.string(),
});

// --- Person Details ---

const NameSchema = z.object({
  'given-names': StringValueSchema.nullable(),
  'family-name': StringValueSchema.nullable(),
  'credit-name': StringValueSchema.nullable(),
});

const BiographySchema = z.object({
  content: z.string(),
  'created-date': TimestampSchema,
  'last-modified-date': TimestampSchema,
});

const OtherNameSchema = z.object({
  content: z.string(),
  'created-date': TimestampSchema,
  'last-modified-date': TimestampSchema,
});

const ResearcherUrlSchema = z.object({
  'url-name': z.string().nullable(),
  url: StringValueSchema,
  'created-date': TimestampSchema,
  'last-modified-date': TimestampSchema,
});

const PersonSchema = z.object({
  'last-modified-date': TimestampSchema.nullable(),
  name: NameSchema,
  biography: BiographySchema.nullable(),
  'researcher-urls': z.object({ 'researcher-url': z.array(ResearcherUrlSchema) }).nullable(),
  'other-names': z.object({ 'other-name': z.array(OtherNameSchema) }).nullable(),
});

// --- Main Schema for the Entire API Response ---

export const OrcidApiResponseSchema = z.object({
  'orcid-identifier': OrcidIdentifierSchema,
  person: PersonSchema,
});

// You can infer a TypeScript type directly from the schema
export type OrcidApiResponse = z.infer<typeof OrcidApiResponseSchema>;
