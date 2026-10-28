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
  'custom_dataset_created',
  'custom_dataset_updated',
  'custom_dataset_deleted',
  'custom_dataset_uploaded',
]);
export type AuditLogAction = z.infer<typeof auditLogActionSchema>;

// Payload Schemas
const roundCreatedPayloadSchema = z.any().optional();
const roundSettingsChangedPayloadSchema = z.any().optional();
const roundAdminsChangedPayloadSchema = z.any().optional();
const roundVotersChangedPayloadSchema = z.any().optional();
const roundPublishedPayloadSchema = z.null();
const roundDeletedPayloadSchema = z.null();
const applicationSubmittedPayloadSchema = z.any().optional();
const applicationsReviewedPayloadSchema = z.any().optional();
const applicationUpdatedPayloadSchema = z.any().optional();
const ballotSubmittedPayloadSchema = z.any().optional();
const ballotUpdatedPayloadSchema = z.any().optional();
const resultsCalculatedPayloadSchema = z.any().optional();
const resultPublishedPayloadSchema = z.null();
const linkedDripListsEditedPayloadSchema = z.object({
  dripListAccountIds: z.array(z.string()),
});
const applicationCategoryCreatedPayloadSchema = z.any().optional();
const applicationCategoryUpdatedPayloadSchema = z.any().optional();
const applicationCategoryDeletedPayloadSchema = z.any().optional();
const applicationFormCreatedPayloadSchema = z.any().optional();
const applicationFormUpdatedPayloadSchema = z.any().optional();
const applicationFormDeletedPayloadSchema = z.any().optional();
const kycRequestCreatedPayloadSchema = z.any().optional();
const kycRequestLinkedToApplicationPayloadSchema = z.any().optional();
const kycRequestUpdatedPayloadSchema = z.any().optional();
const customDatasetCreatedPayloadSchema = z.any().optional();
const customDatasetUpdatedPayloadSchema = z.any().optional();
const customDatasetDeletedPayloadSchema = z.any().optional();
const customDatasetUploadedPayloadSchema = z.any().optional();

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
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.custom_dataset_created),
    payload: customDatasetCreatedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.custom_dataset_updated),
    payload: customDatasetUpdatedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.custom_dataset_deleted),
    payload: customDatasetDeletedPayloadSchema,
  }),
  baseAuditLogSchema.extend({
    action: z.literal(auditLogActionSchema.enum.custom_dataset_uploaded),
    payload: customDatasetUploadedPayloadSchema,
  }),
]);

export type AuditLog = z.infer<typeof auditLogSchema>;
