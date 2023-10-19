import query from '$lib/graphql/dripsQL';
import type { Project } from '$lib/graphql/generated/graphql';
import DripListService from '$lib/utils/driplist/DripListService';
import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type { DripList } from '$lib/utils/metadata/types';
import { gql } from 'graphql-request';
import { Utils, AddressDriverClient } from 'radicle-drips';

export interface SplitsEntryWrapper<T> {
  value: T;
  weight: number;
}

export default async function getIncomingSplits(accountId: string): Promise<{
  users: SplitsEntryWrapper<{
    driver: 'address';
    address: string;
    accountId: string;
  }>[];
  projects: SplitsEntryWrapper<Project>[];
  dripLists: SplitsEntryWrapper<DripList>[];
}> {
  const subgraph = getSubgraphClient();
  const dripListService = await DripListService.new();

  const incomingSplits = await subgraph.getSplitEntriesByReceiverAccountId(accountId);

  const incomingAddressDriverSplits = incomingSplits.filter(
    (s) => Utils.AccountId.getDriver(s.senderId) === 'address',
  );

  const incomingNFTDriverSplits = incomingSplits.filter(
    (s) => Utils.AccountId.getDriver(s.senderId) === 'nft',
  );
  const dripListFetches = incomingNFTDriverSplits.map(async (s) => {
    const dripList = await dripListService.getByTokenId(s.senderId);
    if (!dripList) return undefined;

    return { value: dripList, weight: Number(s.weight) };
  });

  const incomingRepoDriverSplits = incomingSplits.filter(
    (s) => Utils.AccountId.getDriver(s.senderId) === 'repo',
  );

  const projectFetches = incomingRepoDriverSplits.map(async (s) => {
    const getProjectByIdQuery = gql`
      query Project($projectId: ID!) {
        project(id: $projectId) {
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
                  driver
                  type
                  weight
                  dripList {
                    id
                    isPublic
                    owner {
                      accountId
                      address
                      driver
                    }
                    previousOwnerAddress
                    name
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

    const response = await query<{ project: Project | null }>(getProjectByIdQuery, {
      projectId: s.senderId,
    });

    const project = response.project;
    if (!project) return undefined;

    return { value: project, weight: Number(s.weight) };
  });

  const fetchResults = await Promise.all([
    Promise.all(dripListFetches),
    Promise.all(projectFetches),
  ]);

  return {
    users: incomingAddressDriverSplits.map((s) => ({
      weight: Number(s.weight),
      value: {
        address: AddressDriverClient.getUserAddress(s.senderId),
        driver: 'address',
        accountId: s.senderId,
      },
    })),
    projects: mapFilterUndefined(fetchResults[1], (v) => v as SplitsEntryWrapper<Project>),
    dripLists: mapFilterUndefined(fetchResults[0], (v) => v as SplitsEntryWrapper<DripList>),
  };
}
