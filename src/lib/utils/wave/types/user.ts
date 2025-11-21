import z from 'zod';

export const waveUserDtoSchema = z.object({
  id: z.uuid(),
  gitHubUsername: z.string(),
  gitHubAvatarUrl: z.url(),
});
export type WaveUser = z.infer<typeof waveUserDtoSchema>;
