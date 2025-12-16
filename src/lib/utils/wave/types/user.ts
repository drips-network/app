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
