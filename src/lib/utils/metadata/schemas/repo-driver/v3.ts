import { z } from 'zod';
import { sourceSchema } from '../common/sources';

const dripListSplitReceiverSchema = z.object({
  type: z.literal('dripList'),
  weight: z.number(),
  accountId: z.string(),
});

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

const repoDriverAccountSplitsSchema = z.object({
  maintainers: z.array(addressDriverSplitReceiverSchema),
  dependencies: z.array(
    z.union([
      dripListSplitReceiverSchema,
      repoDriverSplitReceiverSchema,
      addressDriverSplitReceiverSchema,
    ]),
  ),
});

export const repoDriverAccountMetadataSchemaV3 = z.object({
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
