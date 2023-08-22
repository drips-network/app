import { z } from 'zod';
import { sourceSchema } from '../common/sources';

const addressDriverSplitReceiverSchema = z.object({
  weight: z.number(),
  accountId: z.string(),
});

const repoDriverSplitReceiverSchema = z.object({
  weight: z.number(),
  accountId: z.string(),
  source: sourceSchema,
});

const repoDriverAccountSplitsSchema = z.object({
  maintainers: z.array(addressDriverSplitReceiverSchema),
  dependencies: z.array(z.union([repoDriverSplitReceiverSchema, addressDriverSplitReceiverSchema])),
});

export const repoDriverAccountMetadataSchemaV1 = z.object({
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
