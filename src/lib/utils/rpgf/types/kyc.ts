import z from 'zod';

const kycTypeSchema = z.enum(['INDIVIDUAL', 'BUSINESS']);
export type KycType = z.infer<typeof kycTypeSchema>;

export const kycProviderSchema = z.enum(['Fern']);
export type KycProvider = z.infer<typeof kycProviderSchema>;

const kycStatusSchema = z.enum([
  'CREATED',
  'UNDER_REVIEW',
  'NEEDS_ADDITIONAL_INFORMATION',
  'ACTIVE',
  'REJECTED',
  'DEACTIVATED',
]);
export type KycStatus = z.infer<typeof kycStatusSchema>;

export const kycRequestSchema = z.object({
  id: z.string(),
  kycType: kycTypeSchema,
  kycRequestId: z.string(),
  kycEmail: z.string().email(),
  kycFormUrl: z.string().url(),
  status: kycStatusSchema,
  updatedAt: z.string().pipe(z.coerce.date()),
});
export type KycRequest = z.infer<typeof kycRequestSchema>;

export type CreateKycRequestForApplicationDto = {
  type: KycType;
  firstName: string;
  lastName: string;
  businessName?: string;
  email: string;
};
