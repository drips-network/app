import query from '../../graphql/dripsQL';
import { LIST_EDITOR_DRIP_LIST_FRAGMENT, LIST_EDITOR_PROJECT_FRAGMENT } from './types';
import { gql } from 'graphql-request';
import type { RecipientResult } from './types';
import type {
  GetDripListQuery,
  GetDripListQueryVariables,
  GetProjectQuery,
  GetProjectQueryVariables,
} from './__generated__/gql.generated';
import { isAddress } from 'ethers';

export const getDripList = async (dripListId: string): Promise<RecipientResult> => {
  const res = await query<GetDripListQuery, GetDripListQueryVariables>(
    gql`
      ${LIST_EDITOR_DRIP_LIST_FRAGMENT}
      query GetDripList($id: ID!) {
        dripList: dripList(id: $id) {
          ...ListEditorDripList
          account {
            accountId
          }
        }
      }
    `,
    { id: dripListId },
  );

  if (!res.dripList) {
    return null;
  }

  return {
    accountId: res.dripList.account.accountId,
    dripList: res.dripList,
  };
};

export const getProject = async (url: string): Promise<RecipientResult> => {
  const res = await query<GetProjectQuery, GetProjectQueryVariables>(
    gql`
      ${LIST_EDITOR_PROJECT_FRAGMENT}
      query GetProject($url: String!) {
        project: projectByUrl(url: $url) {
          ...ListEditorProject
          ... on ClaimedProject {
            account {
              accountId
            }
          }
          ... on UnclaimedProject {
            account {
              accountId
            }
          }
        }
      }
    `,
    { url },
  );

  if (!res.project) {
    return null;
  }

  return {
    accountId: res.project.account.accountId,
    project: res.project,
  };
};

function calcAccountId(addr: string): bigint {
  if (!isAddress(addr)) {
    throw new Error('Invalid Ethereum address format');
  }

  const driverId = 0;

  const addrBigInt = BigInt(addr);

  // Shift left by 224 bits to make space for the address
  let accountId = BigInt(driverId) << 224n;

  // Combine the shifted driverId and the address BigInt
  accountId |= addrBigInt;

  return accountId;
}

export const getAddress = async (address: string): Promise<RecipientResult> => {
  try {
    const accountId = String(calcAccountId(address));
    return {
      accountId,
      address,
    };
  } catch (error) {
    if ((error as Error).message.includes('Address validation')) {
      return null;
    }

    throw error;
  }
};
