import { redis, type RedisClientType } from '../../redis';
import query from '$lib/graphql/dripsQL';
import isClaimed from '$lib/utils/project/is-claimed';
import type {
  DripListAssociatedAccountIdsQuery,
  DripListAssociatedAccountIdsQueryVariables,
  ProjectAssociatedAccountIdsQuery,
  ProjectAssociatedAccountIdsQueryVariables,
} from './queries/__generated__/gql.generated';
import {
  dripListAssociatedAccountIdsQuery,
  projectAssociatedAccountIdsQuery,
} from './queries/associated-account-ids-queries';
import { error } from '@sveltejs/kit';
import { extractDriverNameFromAccountId } from '$lib/utils/sdk/utils/extract-driver-from-accountId';

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
  >(projectAssociatedAccountIdsQuery, { projectAccountId }, fetch);
  const project = associatedAccountIds.projectById;

  if (project) {
    const accountIdsToClear = [
      projectAccountId,
      ...project.support.map((support) => support.account.accountId),
      ...(isClaimed(project)
        ? project.splits.dependencies.map((dependency) => dependency.account.accountId)
        : []),
      ...(isClaimed(project)
        ? project.splits.maintainers.map((maintainer) => maintainer.account.accountId)
        : []),
      ...(isClaimed(project) ? [project.owner.accountId] : []),
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
  >(dripListAssociatedAccountIdsQuery, { dripListAccountId }, fetch);
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
      const driver = extractDriverNameFromAccountId(accountId);

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
