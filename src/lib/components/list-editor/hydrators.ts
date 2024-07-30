import type {
  GetDripListQuery,
  GetDripListQueryVariables,
  GetProjectQuery,
  GetProjectQueryVariables,
} from './components/__generated__/gql.generated';
import query from '../../graphql/dripsQL';
import { LIST_EDITOR_DRIP_LIST_FRAGMENT, LIST_EDITOR_PROJECT_FRAGMENT } from './types';
import { getAddressDriverClient } from '../../utils/get-drips-clients';
import { gql } from 'graphql-request';

export const getDripList = async (dripListId: string) => {
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

export const getProject = async (url: string) => {
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

export const getAddress = async (address: string) => {
  const addressDriverClient = await getAddressDriverClient();
  const accountId = await addressDriverClient.getAccountIdByAddress(address);
  return {
    accountId,
    address,
  };
};
