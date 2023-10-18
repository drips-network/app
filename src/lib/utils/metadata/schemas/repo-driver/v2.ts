import { z } from 'zod';
import { sourceSchema } from '../common/sources';

export const addressDriverSplitReceiverSchema = z.object({
  type: z.literal('address'),
  weight: z.number(),
  accountId: z.string(),
});

export const repoDriverSplitReceiverSchema = z.object({
  type: z.literal('repoDriver'),
  weight: z.number(),
  accountId: z.string(),
  source: sourceSchema,
});

const repoDriverAccountSplitsSchema = z.object({
  maintainers: z.array(addressDriverSplitReceiverSchema),
  dependencies: z.array(z.union([repoDriverSplitReceiverSchema, addressDriverSplitReceiverSchema])),
});

export const repoDriverAccountMetadataSchemaV2 = z.object({
  driver: z.literal('repo'),
  describes: z.object({
    driver: z.literal('repo'),
    accountId: z.string(),
  }),
  source: sourceSchema,
  emoji: z.string(),
  color: z.string(),
  description: z.string().optional(),
  splits: repoDriverAccountSplitsSchema,
});
