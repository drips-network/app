import z from 'zod';
import { sourceSchema } from './sources';

// Here, until there is a need to create specific `RepoSubAccountDriver` metadata.
export const repoSubAccountDriverSplitReceiverSchema = z.object({
  type: z.literal('repoSubAccountDriver'),
  weight: z.number(),
  accountId: z.string(),
  source: sourceSchema,
});
