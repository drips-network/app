import z from 'zod';

export const repoDtoSchema = z.object({
  id: z.uuid(),
  gitHubRepoName: z.string(),
  gitHubRepoFullName: z.string(),
  gitHubRepoUrl: z.string(),
  org: z.object({
    id: z.uuid(),
    gitHubOrgLogin: z.string(),
    gitHubOrgName: z.string().nullable(),
    gitHubOrgAvatarUrl: z.string().nullable(),
  }),
});
export type Repo = z.infer<typeof repoDtoSchema>;
