import { ethers, type ContractTransaction } from 'ethers';
import { AddressDriverClient } from 'radicle-drips';
import { z } from 'zod';
import type { Account, UserId } from './types';
import seperateDripsSetEvents from './methods/separate-drips-set-events';
import buildAssetConfigs from './methods/build-asset-configs';
import { getAddressDriverClient, getSubgraphClient } from '$lib/utils/get-drips-clients';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import { reconcileDripsSetReceivers } from './methods/reconcile-drips-set-receivers';
import isTest from '$lib/utils/is-test';
import { fetchIpfs as ipfsFetch } from '$lib/utils/ipfs';

export const USER_DATA_KEY = 'ipfs';

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
  const getLatestUserMetadata = await getSubgraphClient().getLatestUserMetadata(
    userId,
    USER_DATA_KEY,
  );

  if (!getLatestUserMetadata) return undefined;

  try {
    return getLatestUserMetadata.value;
  } catch {
    return undefined;
  }
}

async function fetchIpfs(hash: string) {
  if (isTest()) {
    const val = JSON.parse(localStorage.getItem(`mock_ipfs_${hash}`) ?? '');
    return val;
  }

  return await (await ipfsFetch(hash)).json();
}

export async function pinAccountMetadata(data: z.infer<typeof accountMetadataSchema>) {
  if (isTest()) {
    const mockHash = (Math.random() + 1).toString(36).substring(7);
    const mockData = JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    );

    localStorage.setItem(`mock_ipfs_${mockHash}`, mockData);

    return mockHash;
  }

  const res = await fetch('/api/ipfs/pin', {
    method: 'POST',
    body: JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
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
 * @param address The address of the account owner.
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
    timestamp: Math.floor(new Date().getTime() / 1000),
    writtenByAddress: address,
    assetConfigs: mapFilterUndefined(forAccount.assetConfigs, (assetConfig) => ({
      tokenAddress: assetConfig.tokenAddress,
      streams: mapFilterUndefined(assetConfig.streams, (stream) => {
        if (stream.managed === false) return undefined;

        return {
          id: stream.id,
          initialDripsConfig: {
            dripId: stream.dripsConfig.dripId,
            raw: stream.dripsConfig.raw.toString(),
            startTimestamp: Math.floor((stream.dripsConfig.startDate?.getTime() || 0) / 1000),
            durationSeconds: stream.dripsConfig.durationSeconds || 0,
            amountPerSecond: stream.dripsConfig.amountPerSecond.amount,
          },
          receiver: stream.receiver,
          archived: stream.archived ?? false,
          name: stream.name,
          description: stream.description,
        };
      }),
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
  lastKnownHash: string | undefined,
): Promise<{
  newHash: string;
  tx: ContractTransaction;
}> {
  const { userId } = newData.describes;
  const currentOnChainHash = await fetchAccountMetadataHash(userId);

  if (currentOnChainHash !== lastKnownHash) {
    throw new Error(
      "Current metadata hash doesn't match on-chain value." +
        'If your account was edited elsewhere previously, please refresh the page before making further changes.',
    );
  }

  const newHash = await pinAccountMetadata(newData);
  const client = await getAddressDriverClient();
  const tx = await client.emitUserMetadata([
    {
      key: USER_DATA_KEY,
      value: newHash,
    },
  ]);

  return {
    newHash,
    tx,
  };
}

/**
 * Fetch an account, including all its streams. Gets metadata from IPFS, and merges it with on-chain
 * history events.
 * @param userId The user ID of the account to fetch.
 * @returns The account information.
 */
export async function fetchAccount(userId: UserId): Promise<Account> {
  const subgraphClient = getSubgraphClient();

  const { data, hash } = (await fetchAccountMetadata(userId)) ?? {};

  const dripsSetEvents = await subgraphClient.getDripsSetEventsByUserId(userId);
  const dripsSetEventsWithFullReceivers = reconcileDripsSetReceivers(dripsSetEvents);
  const dripsSetEventsByTokenAddress = seperateDripsSetEvents(dripsSetEventsWithFullReceivers);

  const assetConfigs = buildAssetConfigs(userId, data, dripsSetEventsByTokenAddress);

  return {
    user: {
      userId,
      driver: 'address',
      address: AddressDriverClient.getUserAddress(userId),
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
