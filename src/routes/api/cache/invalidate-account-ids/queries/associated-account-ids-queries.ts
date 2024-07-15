import { gql } from 'graphql-request';

export const projectAssociatedAccountIdsQuery = gql`
  query ProjectAssociatedAccountIds($projectAccountId: ID!) {
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

export const dripListAssociatedAccountIdsQuery = gql`
  query DripListAssociatedAccountIds($dripListAccountId: ID!) {
    dripList(id: $dripListAccountId) {
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
