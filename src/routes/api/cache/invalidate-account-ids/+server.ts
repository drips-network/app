import { redis, type RedisClientType } from '../../redis';
import assert from '$lib/utils/assert';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import { Utils } from 'radicle-drips';
import type { AssociatedAccountIdsQuery, AssociatedAccountIdsQueryVariables } from './__generated__/gql.generated';
import unreachable from '$lib/utils/unreachable';
import isClaimed from '$lib/utils/project/is-claimed';

async function invalidateAccountCache(accountId: string, client: RedisClientType) {
  if (!client) return;

  const pattern = `*:${accountId}:*`;

  for await (const key of client.scanIterator({ MATCH: pattern })) {
    await client.del(key);
  }
}

async function invalidateProjectCache(projectAccountId: string, client: RedisClientType) {
  const associatedAccountIdsQuery = gql`
    query AssociatedAccountIds($projectAccountId: ID!) {
      projectById(id: $projectAccountId) {
        ... on ClaimedProject {
          owner {
            accountId
          }
          support {
            ... on ProjectSupport {
              account {
                accountId
              }
            }
            ... on DripListSupport {
              account {
                accountId
              }
            }
            ... on OneTimeDonationSupport {
              account {
                accountId
              }
            }
            ... on StreamSupport {
              account {
                accountId
              }
            }
          }
          splits {
            dependencies {
              ... on AddressReceiver {
                account {
                  accountId
                }
              }
              ... on ProjectReceiver {
                account {
                  accountId
                }
              }
              ... on DripListReceiver {
                account {
                  accountId
                }
              }
            }
            maintainers {
              account {
                accountId
              }
            }
          }
        }
        ... on UnclaimedProject {
          support {
            ... on ProjectSupport {
              account {
                accountId
              }
            }
            ... on DripListSupport {
              account {
                accountId
              }
            }
            ... on OneTimeDonationSupport {
              account {
                accountId
              }
            }
            ... on StreamSupport {
              account {
                accountId
              }
            }
          }
        }
      }
    }
  `;

  const associatedAccountIds = await query<AssociatedAccountIdsQuery, AssociatedAccountIdsQueryVariables>(associatedAccountIdsQuery, { projectAccountId }, fetch);

  const project = associatedAccountIds.projectById;

  if (project) {
    const accountIdsToClear = [
      projectAccountId,
      ...project.support.map((support) => support.__typename === 'SupportGroup' ? unreachable() : support.account.accountId),
      ...isClaimed(project) ? project.splits.dependencies.map((dependency) => dependency.account.accountId) : [],
      ...isClaimed(project) ? project.splits.maintainers.map((maintainer) => maintainer.account.accountId) : [],
      ...(isClaimed(project) ? [project.owner.account.accountId] : []),
    ];

    console.log('invalidateProjectCache', { project, accountIdsToClear })

    await Promise.all(
      accountIdsToClear.map((accountId) => invalidateAccountCache(accountId, client)),
    );
  } else {
    console.log('invalidateProjectCache', { project, accountIdsToClear: [projectAccountId] })

    await invalidateAccountCache(projectAccountId, client);
  }
}

export const POST = async ({ request }) => {
  const accountIds = await request.json();
  console.log('POST invalidate-account-ids', accountIds)
  assert(Array.isArray(accountIds), 'Invalid account ids');

  accountIds.forEach((accountId) => {
    assert(/^[0-9]+$/.test(accountId), `Invalid account ID: ${accountId}`);
  });

  await Promise.all(
    accountIds.map((accountId) => {
      const driver = Utils.AccountId.getDriver(accountId);

      if (driver === 'repo') {
        return invalidateProjectCache(accountId, redis);
      }
    }),
  );

  return new Response('OK');
};
