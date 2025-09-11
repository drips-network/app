import { z } from 'zod';
import { ethereumAddressSchema } from './user';

// Enum Schema
export const auditLogActionSchema = z.enum([
  'round_created',
  'round_settings_changed',
  'round_admins_changed',
  'round_voters_changed',
  'round_published',
  'round_deleted',
  'application_submitted',
  'application_reviewed',
  'ballot_submitted',
  'ballot_updated',
  'results_calculated',
  'results_published',
  'linked_drip_lists_edited',
  'application_category_created',
  'application_category_updated',
  'application_category_deleted',
  'application_form_created',
  'application_form_updated',
  'application_form_deleted',
]);
export type AuditLogAction = z.infer<typeof auditLogActionSchema>;

// Payload Schemas
const roundCreatedPayloadSchema = z.any();
const roundSettingsChangedPayloadSchema = z.any();
const roundAdminsChangedPayloadSchema = z.any();
const roundVotersChangedPayloadSchema = z.any();
const roundPublishedPayloadSchema = z.null();
const roundDeletedPayloadSchema = z.null();
const applicationSubmittedPayloadSchema = z.any();
const applicationsReviewedPayloadSchema = z.any();
const ballotSubmittedPayloadSchema = z.any();
const ballotUpdatedPayloadSchema = z.any();
const resultsCalculatedPayloadSchema = z.any();
const resultPublishedPayloadSchema = z.null();
const linkedDripListsEditedPayloadSchema = z.object({
  dripListAccountIds: z.array(z.string()),
});
const applicationCategoryCreatedPayloadSchema = z.any();
const applicationCategoryUpdatedPayloadSchema = z.any();
const applicationCategoryDeletedPayloadSchema = z.any();
const applicationFormCreatedPayloadSchema = z.any();
const applicationFormUpdatedPayloadSchema = z.any();
const applicationFormDeletedPayloadSchema = z.any();

// Base schema for common fields
const baseAuditLogSchema = z.object({
  id: z.number(),
  userWalletAddress: ethereumAddressSchema,
  createdAt: z.string().transform((str) => new Date(str)),
});

// Discriminated union for the full AuditLog
export const auditLogSchema = z.discriminatedUnion('action', [
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.round_created),
    payload: roundCreatedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.round_settings_changed),
    payload: roundSettingsChangedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.round_admins_changed),
    payload: roundAdminsChangedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.round_voters_changed),
    payload: roundVotersChangedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.round_published),
    payload: roundPublishedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.round_deleted),
    payload: roundDeletedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.application_submitted),
    payload: applicationSubmittedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.application_reviewed),
    payload: applicationsReviewedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.ballot_submitted),
    payload: ballotSubmittedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.ballot_updated),
    payload: ballotUpdatedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.results_calculated),
    payload: resultsCalculatedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.results_published),
    payload: resultPublishedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.linked_drip_lists_edited),
    payload: linkedDripListsEditedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.application_category_created),
    payload: applicationCategoryCreatedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.application_category_updated),
    payload: applicationCategoryUpdatedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.application_category_deleted),
    payload: applicationCategoryDeletedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.application_form_created),
    payload: applicationFormCreatedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.application_form_updated),
    payload: applicationFormUpdatedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.application_form_deleted),
    payload: applicationFormDeletedPayloadSchema,
  }),
]);

export type AuditLog = z.infer<typeof auditLogSchema>;
