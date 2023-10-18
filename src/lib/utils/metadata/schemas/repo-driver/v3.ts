import { z } from 'zod';
import {
  addressDriverSplitReceiverSchema,
  repoDriverAccountMetadataSchemaV2,
  repoDriverSplitReceiverSchema,
} from './v2';

const dripListSplitReceiverSchema = z.object({
  type: z.literal('dripList'),
  weight: z.number(),
  accountId: z.string(),
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

export const repoDriverAccountMetadataSchemaV3 = repoDriverAccountMetadataSchemaV2.extend({
  splits: repoDriverAccountSplitsSchema,
});
