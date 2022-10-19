import { ethers } from 'ethers';
import { AddressDriverClient, DripsSubgraphClient } from 'radicle-drips';
import { get } from 'svelte/store';
import { z } from 'zod';
import wallet from '../wallet';
import type { Account, UserId } from './types';
import seperateDripsSetEvents from './methods/separate-drips-set-events';
import buildAssetConfigs from './methods/build-asset-configs';
import { getAddressDriverClient } from '$lib/utils/get-drips-clients';

const IPFS_GATEWAY_DOMAIN = 'drips.mypinata.cloud';

/*
A randomly-generated uint256 that we use as the `key` value for calls to `emitUserData` on the
drips contracts. This essentially acts as a "namespace", aiming to ensure that this apps reads only the
emitUserData events that it created itself.

If you're an app developer looking at this for reference, make sure to generate your own random uint256
value to use as a `key` value for `emitUserData`, in order to avoid metadata collisions with other apps.
*/
const USER_DATA_KEY =
  65932473927847481224664369441494644980717748729109625944182088338412766444512n;

const addressSchema = z.preprocess((v) => {
  if (typeof v !== 'string' || !ethers.utils.isAddress(v)) {
    throw new Error(`${v} is not a valid address`);
  }

  return v;
}, z.string());

const addressDriverUserSchema = z.object({
  userId: z.string(),
  driver: z.literal('address'),
});

const bigintSchema = z.preprocess((v) => typeof v === 'string' && BigInt(v), z.bigint());

export const userSchema = addressDriverUserSchema;

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

export const streamMetadataSchema = z.object({
  id: z.string(),
  initialDripsConfig: dripsConfigSchema,
  receiver: userSchema,
  archived: z.boolean(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const assetConfigMetadataSchema = z.object({
  tokenAddress: addressSchema,
  streams: z.array(streamMetadataSchema),
});

export const accountMetadataSchema = z.object({
  describes: userSchema,
  name: z.string().optional(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  assetConfigs: z.array(assetConfigMetadataSchema),
  timestamp: z.number(),
  writtenByAddress: addressSchema,
});

export async function fetchAccountMetadataHash(userId: UserId): Promise<string | undefined> {
  // TODO: Real implementation once SDK adds function for getting emitUserData events
  userId;
  // Mocked user ID for tests
  return userId === '875267609686611184008791658115888920329297355417' ? 'foo' : undefined;
}

async function fetchIpfs(hash: string) {
  return await (await fetch(`https://${IPFS_GATEWAY_DOMAIN}/ipfs/${hash}`)).json();
}

async function pinAccountMetadata(data: z.infer<typeof accountMetadataSchema>) {
  const res = await fetch('/api/ipfs/pin', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return res.text();
}

async function fetchAccountMetadata(
  userId: UserId,
): Promise<{ hash: string; data: z.infer<typeof accountMetadataSchema> } | undefined> {
  const metadataHash = await fetchAccountMetadataHash(userId);
  if (!metadataHash) return undefined;

  let accountMetadataRes: Awaited<ReturnType<typeof fetchIpfs>>;

  try {
    accountMetadataRes = await fetchIpfs(metadataHash);
  } catch (e) {
    return undefined;
  }

  return {
    hash: metadataHash,
    data: accountMetadataSchema.parse(accountMetadataRes),
  };
}

/**
 * Generate a metadata object (to be stored on IPFS) for a given account.
 * @param forAccount The account object to convert into the IPFS metadata format.
 * @returns The converted metadata object matching `accountMetadataSchema`.
 */
export function generateMetadata(
  forAccount: Account,
  address: string,
): z.infer<typeof accountMetadataSchema> {
  return {
    describes: forAccount.user,
    name: forAccount.name,
    description: forAccount.description,
    emoji: forAccount.emoji,
    timestamp: new Date().getTime() / 1000,
    writtenByAddress: address,
    assetConfigs: forAccount.assetConfigs.map((assetConfig) => ({
      tokenAddress: assetConfig.tokenAddress,
      streams: assetConfig.streams.map((stream) => ({
        id: stream.id,
        initialDripsConfig: {
          dripId: stream.dripsConfig.dripId,
          raw: stream.dripsConfig.raw.toString(),
          startTimestamp: (stream.dripsConfig.startDate?.getTime() || 0) / 1000,
          durationSeconds: stream.dripsConfig.durationSeconds || 0,
          amountPerSecond: stream.dripsConfig.amountPerSecond.amount,
        },
        receiver: stream.receiver,
        archived: stream.archived ?? false,
        name: stream.name,
        description: stream.description,
      })),
    })),
  };
}

/**
 * Update the metadata for a given account on IPFS and link the new hash to the userId on-chain.
 * @param newData The new metadata to write, matching `accountMetadataSchema`.
 * @param lastKnownHash The IPFS hash of the latest known metadata object.
 * @returns The IPFS hash of the new metadata object.
 * @throw An error if the current on-chain metadata hash value doesn't match `lastKnownHash`,
 * indicating that an edit to metadata has occured after this app instance last fetched metadata.
 * Uploading the new version is prevented in this case to avoid accidentally overwriting data
 * the client instance is currently unaware of. The user should reload the app entirely and
 * re-trigger the desired edit.
 */
export async function updateAccountMetadata(
  newData: z.infer<typeof accountMetadataSchema>,
  lastKnownHash: string,
): Promise<string> {
  const { userId } = newData.describes;
  const currentOnChainHash = await fetchAccountMetadataHash(userId);

  if (currentOnChainHash !== lastKnownHash) {
    throw new Error(
      "Current metadata hash doesn't match on-chain value." +
        'If your account was edited elsewhere previously, please refresh the page before making further changes.',
    );
  }

  const newHash = await pinAccountMetadata(newData);

  await (await getAddressDriverClient()).emitUserMetadata(USER_DATA_KEY, newHash);

  return newHash;
}

/**
 * Fetch an account, including all its streams. Gets metadata from IPFS, and merges it with on-chain
 * history events.
 * @param userId The user ID of the account to fetch.
 * @returns The account information.
 */
export async function fetchAccount(userId: UserId): Promise<Account> {
  const { network } = get(wallet);
  const subgraphClient = DripsSubgraphClient.create(network.chainId);

  const { data, hash } = (await fetchAccountMetadata(userId)) ?? {};

  const dripsSetEvents = seperateDripsSetEvents(
    (await subgraphClient.getDripsSetEventsByUserId(BigInt(userId))).reverse(),
  );

  const assetConfigs = buildAssetConfigs(userId, data, dripsSetEvents);

  return {
    user: {
      userId,
      driver: 'address',
      address: AddressDriverClient.getUserAddress(BigInt(userId)),
    },
    name: data?.name,
    description: data?.description,
    emoji: data?.emoji,
    assetConfigs: assetConfigs ?? [],
    lastUpdated: data ? new Date(data.timestamp * 1000) : undefined,
    lastUpdatedByAddress: data?.writtenByAddress,
    lastIpfsHash: hash,
  };
}
