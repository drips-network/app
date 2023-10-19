import { error } from '@sveltejs/kit';
import fetchUnclaimedFunds from '$lib/utils/project/unclaimed-funds';
import siteExists from '$lib/utils/site-exists';
import type { PageServerLoad } from './$types';
import { buildProjectSplitsData } from '../../../methods/project-splits';
import fetchEarnedFunds from '$lib/utils/project/earned-funds';
import uriDecodeParams from '$lib/utils/url-decode-params';
import getIncomingSplits from '$lib/utils/splits/get-incoming-splits';
import query from '$lib/graphql/dripsQL';
import type { Project, ProjectWhereInput } from '$lib/graphql/generated/graphql';
import { single } from '$lib/utils/linq';
import isClaimed from '$lib/utils/project/is-claimed';
import { gql } from 'graphql-request';

// TODO: This fails if the network is not the default one. We need to support other networks.

export const load = (async ({ params }) => {
  const { githubUsername, githubRepoName } = uriDecodeParams(params);

  const gitHubUrl = `https://github.com/${githubUsername}/${githubRepoName}`;

  if (!(await siteExists(gitHubUrl))) {
    throw error(404);
  }

  try {
    const getProjectsQuery = gql`
      query Projects($where: ProjectWhereInput) {
        projects(where: $where) {
          ... on ClaimedProject {
            account {
              accountId
              driver
            }
            color
            description
            emoji
            owner {
              accountId
              address
              driver
            }
            source {
              forge
              ownerName
              repoName
              url
            }
            verificationStatus
            splits {
              maintainers {
                accountId
                address
                driver
                type
                weight
              }
              dependencies {
                ... on AddressReceiver {
                  accountId
                  address
                  driver
                  type
                  weight
                }
                ... on ProjectReceiver {
                  driver
                  type
                  weight
                  project {
                    ... on ClaimedProject {
                      account {
                        accountId
                        driver
                      }
                      color
                      description
                      emoji
                      owner {
                        accountId
                        address
                        driver
                      }
                      source {
                        forge
                        ownerName
                        repoName
                        url
                      }
                      verificationStatus
                    }
                    ... on UnclaimedProject {
                      account {
                        accountId
                        driver
                      }
                      source {
                        forge
                        ownerName
                        repoName
                        url
                      }
                      verificationStatus
                    }
                  }
                }
                ... on DripListReceiver {
                  weight
                  type
                  driver
                  dripList {
                    id
                  }
                }
              }
            }
          }
          ... on UnclaimedProject {
            account {
              accountId
              driver
            }
            source {
              forge
              ownerName
              repoName
              url
            }
            verificationStatus
          }
        }
      }
    `;

    const { projects } = await query<{ projects: Project[] }, { where: ProjectWhereInput }>(
      getProjectsQuery,
      {
        where: {
          url: gitHubUrl,
        },
      },
    );

    const project = single(projects);

    const unclaimedFunds = isClaimed(project)
      ? undefined
      : fetchUnclaimedFunds(project.account.accountId);

    const earnedFunds = isClaimed(project)
      ? fetchEarnedFunds(project.account.accountId)
      : undefined;

    return {
      project,
      streamed: {
        unclaimedFunds,
        earnedFunds,
        incomingSplits: getIncomingSplits(project.account.accountId),
        splits: buildProjectSplitsData(project),
      },
      blockWhileInitializing: false,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    throw error(500);
  }
}) satisfies PageServerLoad;
