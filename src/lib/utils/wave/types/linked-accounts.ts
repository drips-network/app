import z from 'zod';

export const linkedAccountProviderSchema = z.enum(['discord']);
export type LinkedAccountProvider = z.infer<typeof linkedAccountProviderSchema>;

export const linkedAccountDtoSchema = z.object({
  provider: linkedAccountProviderSchema,
  providerUsername: z.string(),
  providerDisplayName: z.string().nullable(),
  providerAvatarUrl: z.url().nullable(),
  linkedAt: z.coerce.date(),
});
export type LinkedAccountDto = z.infer<typeof linkedAccountDtoSchema>;
