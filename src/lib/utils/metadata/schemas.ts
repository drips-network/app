import { ethers } from 'ethers';
import { z } from 'zod';

const ethAddressSchema = z.preprocess((v) => {
  if (typeof v !== 'string' || !ethers.utils.isAddress(v)) {
    throw new Error(`${v} is not a valid address`);
  }

  return v;
}, z.string());

const bigintSchema = z.preprocess((v) => typeof v === 'string' && BigInt(v), z.bigint());

const gitHubSourceSchema = z.object({
  forge: z.literal('github'),
  repoName: z.string(),
  ownerName: z.string(),
  url: z.string(),
});

const gitLabSourceSchema = z.object({
  forge: z.literal('gitlab'),
  repoName: z.string(),
  ownerName: z.string(),
  host: z.string(),
  url: z.string(),
});

export const sourceSchema = z.union([gitHubSourceSchema, gitLabSourceSchema]);

export const addressDriverSplitReceiverSchema = z.object({
  weight: z.number(),
  userId: z.string(),
});

export const repoDriverSplitReceiverSchema = z.object({
  weight: z.number(),
  userId: z.string(),
  source: sourceSchema,
});

export const splitReceiverSchema = z.object({
  weight: z.number(),
  userId: z.string(),
});

export const dripsConfigSchema = z.object({
  raw: z.string(),
  dripId: z.string(),
  amountPerSecond: bigintSchema,
  /** If zero, the stream runs indefinitely. */
  durationSeconds: z.number(),
  /**
   * If undefined, the block timestamp from the initial setDrips event
   * corresponding to this stream should be considered as the stream
   * start date.
   */
  startTimestamp: z.number().optional(),
});

export const dripsUserSchema = z.object({
  driver: z.union([z.literal('address'), z.literal('nft'), z.literal('repo')]),
  userId: z.string(),
});

export const streamMetadataSchema = z.object({
  id: z.string(),
  initialDripsConfig: dripsConfigSchema,
  receiver: dripsUserSchema,
  archived: z.boolean(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const assetConfigMetadataSchema = z.object({
  tokenAddress: ethAddressSchema,
  streams: z.array(streamMetadataSchema),
});

export const addressDriverAccountMetadataSchema = z.object({
  describes: z.object({
    driver: z.literal('address'),
    userId: z.string(),
  }),
  name: z.string().optional(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  assetConfigs: z.array(assetConfigMetadataSchema),
  timestamp: z.number(),
  writtenByAddress: ethAddressSchema,
});

export const repoDriverAccountSplitsSchema = z.object({
  maintainers: z.array(addressDriverSplitReceiverSchema),
  dependencies: z.array(z.union([addressDriverSplitReceiverSchema, repoDriverSplitReceiverSchema])),
  dripsDonation: splitReceiverSchema.optional(),
});

export const repoDriverAccountMetadataSchema = z.object({
  driver: z.literal('repo'),
  describes: z.object({
    driver: z.literal('repo'),
    userId: z.string(),
  }),
  source: sourceSchema,
  emoji: z.string(),
  color: z.string(),
  description: z.string().optional(),
  splits: repoDriverAccountSplitsSchema,
});

export const nftDriverAccountMetadataSchema = z.object({
  driver: z.literal('nft'),
  describes: z.object({
    driver: z.literal('nft'),
    userId: z.string(),
  }),
  isDripList: z.literal(true),
  projects: z.array(repoDriverSplitReceiverSchema),
  name: z.string().optional(),
});
