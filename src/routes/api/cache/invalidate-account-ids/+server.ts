import { redis, type RedisClientType } from '../../redis';
import query from '$lib/graphql/dripsQL';
import { Utils } from 'radicle-drips';
import isClaimed from '$lib/utils/project/is-claimed';
import {
  dripListAssociatedAccountIdsQuery,
  projectAssociatedAccountIdsQuery,
} from './queries/associated-account-ids-queries';
import { error } from '@sveltejs/kit';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
import type {
  DripListAssociatedAccountIdsQuery,
  DripListAssociatedAccountIdsQueryVariables,
  ProjectAssociatedAccountIdsQuery,
  ProjectAssociatedAccountIdsQueryVariables,
} from './queries/__generated__/gql.generated';
import network from '$lib/stores/wallet/network';

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
      ...chainData.support.map((support) => support.account.accountId),
      ...(isClaimed(chainData)
        ? chainData.splits.dependencies.map((dependency) => dependency.account.accountId)
        : []),
      ...(isClaimed(chainData)
        ? chainData.splits.maintainers.map((maintainer) => maintainer.account.accountId)
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

async function invalidateDripListCache(dripListAccountId: string, client: RedisClientType) {
  log('INVALIDATE DRIP LIST CACHE', { dripListAccountId });

  const associatedAccountIds = await query<
    DripListAssociatedAccountIdsQuery,
    DripListAssociatedAccountIdsQueryVariables
  >(dripListAssociatedAccountIdsQuery, { dripListAccountId, chain: network.gqlName }, fetch);
  const { dripList } = associatedAccountIds;

  if (dripList) {
    const accountIdsToClear = [
      dripListAccountId,
      dripList.owner.accountId,
      ...dripList.support.map((support) => support.account.accountId),
      ...dripList.splits.map((split) => split.account.accountId),
    ];

    await Promise.all(
      accountIdsToClear.map((accountId) => invalidateAccountCache(accountId, client)),
    );
  } else {
    await invalidateAccountCache(dripListAccountId, client);
  }
}

export const POST = async ({ request }) => {
  if (!redis) return new Response('OK (no cache)');

  const accountIds = await request.json();
  log('INVALIDATE ACCOUNT IDS', { accountIds });

  if (!Array.isArray(accountIds)) {
    throw error(400);
  }

  const validAccountIds: string[] = accountIds.filter((v) => {
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
      const driver = Utils.AccountId.getDriver(accountId);

      switch (driver) {
        case 'repo':
          return invalidateProjectCache(accountId, redis);
        case 'nft':
          return invalidateDripListCache(accountId, redis);
      }
    }),
  );

  return new Response('OK');
};
