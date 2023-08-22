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

export const nftDriverAccountMetadataSchemaV1 = z.object({
  driver: z.literal('nft'),
  describes: z.object({
    driver: z.literal('nft'),
    accountId: z.string(),
  }),
  isDripList: z.literal(true),
  projects: z.array(z.union([repoDriverSplitReceiverSchema, addressDriverSplitReceiverSchema])),
  name: z.string().optional(),
});
