import { z } from 'zod';
import { sourceSchema } from '../common/sources';

const addressDriverSplitReceiverSchema = z.object({
  type: z.literal('address'),
  weight: z.number(),
  accountId: z.string(),
});

const repoDriverSplitReceiverSchema = z.object({
  type: z.literal('repoDriver'),
  weight: z.number(),
  accountId: z.string(),
  source: sourceSchema,
});

/**
 * A splits entry that splits directly to a different Drip List.
 */
const dripListSplitReceiverSchema = z.object({
  type: z.literal('dripList'),
  weight: z.number(),
  accountId: z.string(),
});

export const nftDriverAccountMetadataSchemaV2 = z.object({
  driver: z.literal('nft'),
  describes: z.object({
    driver: z.literal('nft'),
    accountId: z.string(),
  }),
  isDripList: z.literal(true),
  projects: z.array(
    z.union([
      dripListSplitReceiverSchema,
      repoDriverSplitReceiverSchema,
      addressDriverSplitReceiverSchema,
    ]),
  ),
  name: z.string().optional(),
});
