import { z } from 'zod';
import { ethereumAddressSchema } from './user';
import { kycProviderSchema } from './kyc';

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
  'application_updated',
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
  'kyc_request_created',
  'kyc_request_linked_to_application',
  'kyc_request_updated',
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
const applicationUpdatedPayloadSchema = z.any();
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
const kycRequestCreatedPayloadSchema = z.any();
const kycRequestLinkedToApplicationPayloadSchema = z.any();
const kycRequestUpdatedPayloadSchema = z.any();

const userActorSchema = z.object({
  type: z.literal('user'),
  userId: z.string(),
  walletAddress: ethereumAddressSchema,
});
const systemActorSchema = z.object({
  type: z.literal('system'),
});
const kycProviderActorSchema = z.object({
  type: z.literal('kyc-provider'),
  provider: kycProviderSchema,
});

const actorSchema = z.discriminatedUnion('type', [
  userActorSchema,
  systemActorSchema,
  kycProviderActorSchema,
]);
export type AuditLogActor = z.infer<typeof actorSchema>;

// Base schema for common fields
const baseAuditLogSchema = z.object({
  id: z.number(),
  actor: actorSchema,
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
    action: z.literal(auditLogActionSchema.enum.application_updated),
    payload: applicationUpdatedPayloadSchema,
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
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.kyc_request_created),
    payload: kycRequestCreatedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.kyc_request_linked_to_application),
    payload: kycRequestLinkedToApplicationPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.kyc_request_updated),
    payload: kycRequestUpdatedPayloadSchema,
  }),
]);

export type AuditLog = z.infer<typeof auditLogSchema>;
