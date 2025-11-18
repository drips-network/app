import { redis, type RedisClientType } from '../../redis';
import query from '$lib/graphql/dripsQL';
import isClaimed from '$lib/utils/project/is-claimed';
import {
  dripListAssociatedAccountIdsQuery,
  ecosystemAssociatedAccountIdsQuery,
  projectAssociatedAccountIdsQuery,
} from './queries/associated-account-ids-queries';
import { error } from '@sveltejs/kit';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
import type {
  DripListAssociatedAccountIdsQuery,
  DripListAssociatedAccountIdsQueryVariables,
  EcosystemAssociatedAccountIdsQuery,
  EcosystemAssociatedAccountIdsQueryVariables,
  ProjectAssociatedAccountIdsQuery,
  ProjectAssociatedAccountIdsQueryVariables,
} from './queries/__generated__/gql.generated';
import network from '$lib/stores/wallet/network';
import { extractDriverNameFromAccountId } from '$lib/utils/sdk/utils/extract-driver-from-accountId';
import FEATURED_DRIP_LISTS_CONFIG from '../../../(pages)/app/(app)/drip-lists/components/featured-drip-lists-config';

const ENABLE_INVALIDATE_LOGS = true;

function log(...content: unknown[]) {
  if (ENABLE_INVALIDATE_LOGS) {
    // eslint-disable-next-line no-console
    console.log(...content);
  }
}

async function invalidateAccountCache(accountId: string, client: RedisClientType) {
  log('INVALIDATE ACCOUNT CACHE', { accountId });

  if (!client) return;

  const pattern = `*:${accountId}:*`;

  for await (const key of client.scanIterator({ MATCH: pattern })) {
    await client.del(key);
  }
}

async function invalidateExplorePageCache(client: RedisClientType) {
  log('INVALIDATE EXPLORE PAGE CACHE');

  if (!client) return;

  const pattern = `${network.name}-explore-page:*`;

  for await (const key of client.scanIterator({ MATCH: pattern })) {
    await client.del(key);
  }
}

async function invalidateProjectCache(projectAccountId: string, client: RedisClientType) {
  log('INVALIDATE PROJECT CACHE', { projectAccountId });

  const associatedAccountIds = await query<
    ProjectAssociatedAccountIdsQuery,
    ProjectAssociatedAccountIdsQueryVariables
  >(projectAssociatedAccountIdsQuery, { projectAccountId, chains: [network.gqlName] }, fetch);
  const project = associatedAccountIds.projectById;

  if (project) {
    const chainData = filterCurrentChainData(project.chainData);

    const accountIdsToClear = [
      projectAccountId,
      ...chainData.support
        .filter((support) => 'account' in support)
        .map((support) => support.account.accountId),
      ...(isClaimed(chainData)
        ? chainData.splits.dependencies
            .filter((dependency) => 'account' in dependency)
            .map((dependency) => dependency.account.accountId)
        : []),
      ...(isClaimed(chainData)
        ? chainData.splits.maintainers
            .filter((maintainer) => 'account' in maintainer)
            .map((maintainer) => maintainer.account.accountId)
        : []),
      ...(isClaimed(chainData) ? [chainData.owner.accountId] : []),
    ];

    await Promise.all(
      accountIdsToClear.map((accountId) => invalidateAccountCache(accountId, client)),
    );
  } else {
    await invalidateAccountCache(projectAccountId, client);
  }
}

async function invalidateNftDriverCache(nftDriverAccountId: string, client: RedisClientType) {
  log('INVALIDATE NFT DRIVER CACHE', { nftDriverAccountId });

  const associatedAccountIds = await query<
    DripListAssociatedAccountIdsQuery,
    DripListAssociatedAccountIdsQueryVariables
  >(
    dripListAssociatedAccountIdsQuery,
    { dripListAccountId: nftDriverAccountId, chain: network.gqlName },
    fetch,
  );
  const { dripList } = associatedAccountIds;

  if (dripList) {
    const accountIdsToClear = [
      nftDriverAccountId,
      dripList.owner.accountId,
      ...dripList.support
        .filter((support) => 'account' in support)
        .map((support) => support.account.accountId),
      ...dripList.splits
        .filter((split) => 'account' in split)
        .map((split) => split.account.accountId),
    ];

    return Promise.all(
      accountIdsToClear.map((accountId) => invalidateAccountCache(accountId, client)),
    );
  }

  const associatedEcosystemAccountIds = await query<
    EcosystemAssociatedAccountIdsQuery,
    EcosystemAssociatedAccountIdsQueryVariables
  >(
    ecosystemAssociatedAccountIdsQuery,
    { ecosystemAccountId: nftDriverAccountId, chain: network.gqlName },
    fetch,
  );
  const { ecosystemMainAccount } = associatedEcosystemAccountIds;
  if (ecosystemMainAccount) {
    const accountIdsToClear = [
      nftDriverAccountId,
      ecosystemMainAccount.owner.accountId,
      ...ecosystemMainAccount.support
        .filter((support) => 'account' in support)
        .map((support) => support.account.accountId),
      ...ecosystemMainAccount.splits
        .filter((split) => 'account' in split)
        .map((split) => split.account.accountId),
    ];

    return Promise.all(
      accountIdsToClear.map((accountId) => invalidateAccountCache(accountId, client)),
    );
  }

  return invalidateAccountCache(nftDriverAccountId, client);
}

export const POST = async ({ request }) => {
  if (!redis) return new Response('OK (no cache)');

  const accountIds = await request.json();
  log('INVALIDATE ACCOUNT IDS', { accountIds });

  if (!Array.isArray(accountIds)) {
    throw error(400);
  }

  const accountIdStrings = accountIds.map((v) => String(v));

  const validAccountIds: string[] = accountIdStrings.filter((v) => {
    if (typeof v === 'string' && /^[0-9]+$/.test(v)) {
      return true;
    } else {
      log('INVALID ACCOUNT ID', { accountId: v });
      return false;
    }
  });

  // Process max 100 account ids. If there's more than that something must be wrong
  // or it's some kind of script kiddie DOS attempt.
  validAccountIds.splice(100);

  await Promise.all(
    validAccountIds.map((accountId) => {
      const driver = extractDriverNameFromAccountId(accountId);

      switch (driver) {
        case 'repo':
          return invalidateProjectCache(accountId, redis);
        case 'nft':
          return invalidateNftDriverCache(accountId, redis);
      }
    }),
  );

  // Check if any of the invalidated account IDs are featured on the explore page
  const allFeaturedDripListIds = (
    Object.values(FEATURED_DRIP_LISTS_CONFIG) as Array<{ featuredDripListIds?: string[] }>
  ).flatMap((config) => config.featuredDripListIds ?? []);

  const shouldInvalidateExplorePage = validAccountIds.some((accountId) =>
    allFeaturedDripListIds.includes(accountId),
  );

  if (shouldInvalidateExplorePage) {
    await invalidateExplorePageCache(redis);
  }

  return new Response('OK');
};
