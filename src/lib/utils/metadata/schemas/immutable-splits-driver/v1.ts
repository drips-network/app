import z from 'zod';
import { addressDriverSplitReceiverSchema } from '../repo-driver/v2';
import { dripListSplitReceiverSchema } from '../nft-driver/v2';
import { repoSubAccountDriverSplitReceiverSchema } from '../common/repoSubAccountDriverSplitReceiverSchema';

export const subListSplitReceiverSchema = z.object({
  type: z.literal('subList'),
  weight: z.number(),
  accountId: z.string(),
});

export const subListMetadataSchemaV1 = z.object({
  driver: z.literal('immutable-splits'),
  type: z.literal('subList'),
  recipients: z.array(
    z.union([
      addressDriverSplitReceiverSchema,
      dripListSplitReceiverSchema,
      repoSubAccountDriverSplitReceiverSchema,
      subListSplitReceiverSchema,
    ]),
  ),
  parent: z.object({
    accountId: z.string(),
    driver: z.union([z.literal('nft'), z.literal('immutable-splits')]),
    type: z.union([
      z.literal('dripList'),
      z.literal('ecosystem'),
      z.literal('subList'),
    ]),
  }),
  root: z.object({
    accountId: z.string(),
    driver: z.union([z.literal('nft'), z.literal('immutable-splits')]),
    type: z.union([
      z.literal('dripList'),
      z.literal('ecosystem'),
      z.literal('subList'),
    ]),
  }),
});
