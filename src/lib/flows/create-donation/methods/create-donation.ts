import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';
import expect from '$lib/utils/expect';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
import { invalidateAll } from '$app/navigation';
import network from '$lib/stores/wallet/network';
import type {
  ProjectOtDsQuery,
  ProjectOtDsQueryVariables,
  DripListOtDsQuery,
  DripListOtDsQueryVariables,
  EcosystemOtDsQuery,
  EcosystemOtDsQueryVariables,
  OrcidOtDsQuery,
  OrcidOtDsQueryVariables,
  AddressOtDsQuery,
  AddressOtDsQueryVariables,
} from './__generated__/gql.generated';
import type {
  CreateDonationDetailsStepAddressDriverAccountFragment,
  CreateDonationDetailsStepEcosystemFragment,
  CreateDonationDetailsStepNftDriverAccountFragment,
  CreateDonationDetailsStepProjectFragment,
  CreateDonationDetailsStepOrcidFragment,
} from '../__generated__/gql.generated';
import { buildOneTimeDonationTxs } from './build-one-time-donation-txs';

const projectSupportQuery = gql`
  query ProjectOTDs($id: ID!, $chains: [SupportedChain!]!) {
    projectById(id: $id, chains: $chains) {
      chainData {
        ... on ClaimedProjectData {
          chain
          support {
            ... on OneTimeDonationSupport {
              account {
                accountId
              }
              date
            }
          }
        }
        ... on UnClaimedProjectData {
          chain
          support {
            ... on OneTimeDonationSupport {
              account {
                accountId
              }
              date
            }
          }
        }
      }
    }
  }
`;

const dripListSupportQuery = gql`
  query DripListOTDs($id: ID!, $chain: SupportedChain!) {
    dripList(id: $id, chain: $chain) {
      chain
      support {
        ... on OneTimeDonationSupport {
          account {
            accountId
          }
          date
        }
      }
    }
  }
`;

const ecosystemSupportQuery = gql`
  query EcosystemOTDs($accountId: ID!, $chain: SupportedChain!) {
    ecosystemMainAccount(id: $accountId, chain: $chain) {
      chain
      support {
        ... on OneTimeDonationSupport {
          account {
            accountId
          }
          date
        }
      }
    }
  }
`;

const orcidSupportQuery = gql`
  query OrcidOTDs($orcid: String!, $chain: SupportedChain!) {
    orcidLinkedIdentityByOrcid(orcid: $orcid, chain: $chain) {
      chain
      support {
        ... on OneTimeDonationSupport {
          account {
            accountId
          }
          date
        }
      }
    }
  }
`;

const addressSupportQuery = gql`
  query AddressOTDs($address: String!, $chains: [SupportedChain!]!) {
    userByAddress(address: $address, chains: $chains) {
      chainData {
        chain
        support {
          ... on OneTimeDonationSupport {
            account {
              accountId
            }
            date
          }
        }
      }
    }
  }
`;

function checkDonation(
  ownAccountId: string,
  supportAccountId: string,
  supportDate: number,
  blockTimestamp: number,
) {
  return ownAccountId === supportAccountId && supportDate / 1000 === blockTimestamp;
}

export default function (
  dispatch: ReturnType<typeof createEventDispatcher<StepComponentEvents>>,
  recipientAccountId: string,
  recipient:
    | CreateDonationDetailsStepAddressDriverAccountFragment
    | CreateDonationDetailsStepNftDriverAccountFragment
    | CreateDonationDetailsStepProjectFragment
    | CreateDonationDetailsStepEcosystemFragment
    | CreateDonationDetailsStepOrcidFragment,
  tokenAddress: string,
  amountToGive: bigint,
  tokenAllowance: bigint,
  amountInputValue: string,
) {
  dispatch(
    'transact',
    makeTransactPayload({
      headline: 'Donate Instantly',
      before: async () => {
        const { address, dripsAccountId: ownAccountId } = get(walletStore);

        assert(address, 'User is not connected to wallet');
        assert(
          tokenAddress && amountToGive && tokenAllowance !== undefined && amountInputValue,
          'TriggerGiveTransaction step is missing required context',
        );

        const { txs } = await buildOneTimeDonationTxs({
          tokenAddress,
          amount: amountToGive,
          amountInputValue,
          tokenAllowance,
          receiver: recipient,
        });

        return {
          txs,
          tokenAddress,
          ownAccountId,
        };
      },

      transactions: ({ txs }) => txs,

      after: async (receipts, { ownAccountId }) => {
        try {
          const lastReceipt = receipts[receipts.length - 1];
          const blockTimestamp = (await lastReceipt.getBlock()).timestamp;

          switch (recipient.__typename) {
            case 'Project': {
              await expect(
                () =>
                  query<ProjectOtDsQuery, ProjectOtDsQueryVariables>(projectSupportQuery, {
                    id: recipientAccountId,
                    chains: [network.gqlName],
                  }),
                (res) => {
                  const projectData = res.projectById;
                  if (!projectData) return true;

                  return filterCurrentChainData(projectData.chainData).support.some((support) => {
                    if (support.__typename !== 'OneTimeDonationSupport') return false;
                    return checkDonation(
                      ownAccountId,
                      support.account.accountId,
                      support.date,
                      blockTimestamp,
                    );
                  });
                },
                30000,
                1000,
              );
              break;
            }
            case 'EcosystemMainAccount': {
              await expect(
                () =>
                  query<EcosystemOtDsQuery, EcosystemOtDsQueryVariables>(ecosystemSupportQuery, {
                    accountId: recipientAccountId,
                    chain: network.gqlName,
                  }),
                (res) => {
                  const ecoystemData = res.ecosystemMainAccount;
                  if (!ecoystemData) return true;

                  return ecoystemData.support.some((support) => {
                    if (support.__typename !== 'OneTimeDonationSupport') return false;
                    return checkDonation(
                      ownAccountId,
                      support.account.accountId,
                      support.date,
                      blockTimestamp,
                    );
                  });
                },
                30000,
                1000,
              );
              break;
            }
            case 'OrcidLinkedIdentity': {
              await expect(
                () =>
                  query<OrcidOtDsQuery, OrcidOtDsQueryVariables>(orcidSupportQuery, {
                    orcid: recipient.orcid,
                    chain: network.gqlName,
                  }),
                (res) => {
                  const orcidData = res.orcidLinkedIdentityByOrcid;
                  if (!orcidData) return false;

                  return orcidData.support.some((support) => {
                    if (support.__typename !== 'OneTimeDonationSupport') return false;
                    return checkDonation(
                      ownAccountId,
                      support.account.accountId,
                      support.date,
                      blockTimestamp,
                    );
                  });
                },
                30000,
                1000,
              );
              break;
            }
            case 'NftDriverAccount': {
              await expect(
                () =>
                  query<DripListOtDsQuery, DripListOtDsQueryVariables>(dripListSupportQuery, {
                    id: recipientAccountId,
                    chain: network.gqlName,
                  }),
                (res) => {
                  const dripListData = res.dripList;
                  if (!dripListData) return true;

                  return dripListData.support.some((support) => {
                    if (support.__typename !== 'OneTimeDonationSupport') return false;
                    return checkDonation(
                      ownAccountId,
                      support.account.accountId,
                      support.date,
                      blockTimestamp,
                    );
                  });
                },
                30000,
                1000,
              );
              break;
            }
            case 'AddressDriverAccount': {
              await expect(
                () =>
                  query<AddressOtDsQuery, AddressOtDsQueryVariables>(addressSupportQuery, {
                    address: recipient.address,
                    chains: [network.gqlName],
                  }),
                (res) => {
                  const userData = res.userByAddress;
                  if (!userData) return true;

                  return filterCurrentChainData(userData.chainData).support.some((support) => {
                    if (support.__typename !== 'OneTimeDonationSupport') return false;
                    return checkDonation(
                      ownAccountId,
                      support.account.accountId,
                      support.date,
                      blockTimestamp,
                    );
                  });
                },
                30000,
                1000,
              );
              break;
            }
          }

          await invalidateAll();
        } catch {
          return;
        }
      },
    }),
  );
}
