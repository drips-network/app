import { ethers } from 'ethers';
import { z } from 'zod';

const ethAddressSchema = z.preprocess((v) => {
  if (typeof v !== 'string' || !ethers.utils.isAddress(v)) {
    throw new Error(`${v} is not a valid address`);
  }

  return v;
}, z.string());

const bigintSchema = z.preprocess((v) => typeof v === 'string' && BigInt(v), z.bigint());

const streamConfigSchema = z.object({
  raw: z.string(),
  dripId: z.string(),
  amountPerSecond: bigintSchema,
  /** If zero, the stream runs indefinitely. */
  durationSeconds: z.number(),
  /**
   * If undefined, the block timestamp from the initial setStreams event
   * corresponding to this stream should be considered as the stream
   * start date.
   */
  startTimestamp: z.number().optional(),
});

const dripsUserSchema = z.object({
  driver: z.union([z.literal('address'), z.literal('nft'), z.literal('repo')]),
  accountId: z.string(),
});

const streamMetadataSchema = z.object({
  id: z.string(),
  initialDripsConfig: streamConfigSchema,
  receiver: dripsUserSchema,
  archived: z.boolean(),
  name: z.string().optional(),
  description: z.string().optional(),
});

const assetConfigMetadataSchema = z.object({
  tokenAddress: ethAddressSchema,
  streams: z.array(streamMetadataSchema),
});

export const addressDriverAccountMetadataSchemaV1 = z.object({
  describes: z.object({
    driver: z.literal('address'),
    accountId: z.string(),
  }),
  name: z.string().optional(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  assetConfigs: z.array(assetConfigMetadataSchema),
  timestamp: z.number(),
  writtenByAddress: ethAddressSchema,
});
