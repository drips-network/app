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
  repoName: z.string(),
  ownerName: z.string(),
  url: z.string(),
});

const gitLabSourceSchema = z.object({
  repoName: z.string(),
  ownerName: z.string(),
  host: z.string(),
  url: z.string(),
});

const radicleSourceSchema = z.object({
  rid: z.string(),
  repoName: z.string(),
  seed: z.string(),
  url: z.string(),
});

const genericGitSourceSchema = z.object({
  repoName: z.string(),
  url: z.string(),
});

export const sourceSchema = z.union([
  gitHubSourceSchema,
  gitLabSourceSchema,
  radicleSourceSchema,
  genericGitSourceSchema,
]);

export const addressDriverSplitReceiverSchema = z.object({
  weight: z.number(),
  userId: z.string(),
});

export const gitDriverSplitReceiverSchema = z.object({
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
  driver: z.union([z.literal('address'), z.literal('nft'), z.literal('git')]),
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

export const gitDriverAccountMetadataSchema = z.object({
  driver: z.literal('git'),
  describes: z.object({
    driver: z.literal('git'),
    userId: z.string(),
  }),
  source: sourceSchema,
  emoji: z.string(),
  color: z.string(),
  description: z.string().optional(),
  splits: z.object({
    maintainers: z.array(addressDriverSplitReceiverSchema),
    dependencies: z.array(gitDriverSplitReceiverSchema),
    dripsDonation: splitReceiverSchema.optional(),
  }),
});

export const nftDriverAccountMetadataSchema = z.object({
  driver: z.literal('nft'),
  describes: z.object({
    driver: z.literal('nft'),
    userId: z.string(),
  }),
  isDripList: z.literal(true),
  projects: z.array(gitDriverSplitReceiverSchema),
});
