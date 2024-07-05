import { gql } from 'graphql-request';

export const projectAssociatedAccountIdsQuery = gql`
  query ProjectAssociatedAccountIds($projectAccountId: ID!, $chains: [SupportedChain!]!) {
    projectById(id: $projectAccountId, chains: $chains) {
      chainData {
        ... on ClaimedProjectData {
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
        ... on UnClaimedProjectData {
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
  }
`;

export const dripListAssociatedAccountIdsQuery = gql`
  query DripListAssociatedAccountIds($dripListAccountId: ID!, $chain: SupportedChain!) {
    dripList(id: $dripListAccountId, chain: $chain) {
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
    }
  }
`;
