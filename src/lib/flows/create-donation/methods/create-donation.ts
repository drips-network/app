import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { createEventDispatcher } from 'svelte';
import { get } from 'svelte/store';
import assert from '$lib/utils/assert';
import { toBigInt } from 'ethers';
import type { OxString } from '$lib/utils/sdk/sdk-types';
import { populateErc20WriteTx } from '$lib/utils/sdk/erc20/erc20';
import { populateAddressDriverWriteTx } from '$lib/utils/sdk/address-driver/address-driver';
import network from '$lib/stores/wallet/network';
import expect from '$lib/utils/expect';
import query from '$lib/graphql/dripsQL';
import { gql } from 'graphql-request';
import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';
import type {
  ProjectOtDsQuery,
  ProjectOtDsQueryVariables,
  DripListOtDsQuery,
  DripListOtDsQueryVariables,
  EcosystemOtDsQuery,
  EcosystemOtDsQueryVariables,
} from './__generated__/gql.generated';

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
  recipientType: 'AddressDriverAccount' | 'Project' | 'NftDriverAccount' | 'EcosystemMainAccount',
  tokenAddress: string,
  amountToGive: bigint,
  tokenAllowance: bigint,
) {
  dispatch(
    'transact',
    makeTransactPayload({
      headline: 'Donate Instantly',
      before: async () => {
        const { address, dripsAccountId: ownAccountId } = get(walletStore);

        assert(address, 'User is not connected to wallet');
        assert(
          tokenAddress && amountToGive && tokenAllowance !== undefined,
          'TriggerGiveTransaction step is missing required context',
        );

        const needApproval = tokenAllowance < amountToGive;

        const givePopulatedTx = await populateAddressDriverWriteTx({
          functionName: 'give',
          args: [toBigInt(recipientAccountId), tokenAddress as OxString, amountToGive],
        });

        const approvePopulatedTx = await populateErc20WriteTx({
          token: tokenAddress as OxString,
          functionName: 'approve',
          args: [network.contracts.ADDRESS_DRIVER as OxString, amountToGive],
        });

        return {
          givePopulatedTx,
          approvePopulatedTx,
          needApproval,
          tokenAddress,
          ownAccountId,
        };
      },

      transactions: ({ givePopulatedTx, approvePopulatedTx, needApproval }) => [
        ...(needApproval
          ? [
              {
                transaction: approvePopulatedTx,
                applyGasBuffer: false,
                title: `Approve Drips to withdraw the ERC-20`,
              },
            ]
          : []),

        {
          transaction: givePopulatedTx,
          applyGasBuffer: false,
          title: 'Make the one-time donation',
        },
      ],

      after: async (receipts, { ownAccountId }) => {
        try {
          const blockTimestamp = (await receipts[0].getBlock()).timestamp;

          switch (recipientType) {
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
            case 'EcosystemMainAccount':
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
          }

          await invalidateAll();
        } catch {
          return;
        }
      },
    }),
  );
}
