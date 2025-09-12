import query from '../../graphql/dripsQL';
import { LIST_EDITOR_DRIP_LIST_FRAGMENT, LIST_EDITOR_PROJECT_FRAGMENT, LIST_EDITOR_ORCID_FRAGMENT } from './types';
import { gql } from 'graphql-request';
import type { RecipientResult } from './types';
import type {
  GetDripListQuery,
  GetDripListQueryVariables,
  GetProjectQuery,
  GetProjectQueryVariables,
  GetOrcidQuery,
  GetOrcidQueryVariables,
} from './__generated__/gql.generated';
import { isAddress } from 'ethers';
import network from '$lib/stores/wallet/network';
import ListEditor from './list-editor.svelte';
import { fetchOrcid, orcidIdToAccountId } from '../../utils/orcids/fetch-orcid';

export const getDripList = async (dripListId: string): Promise<RecipientResult> => {
  const res = await query<GetDripListQuery, GetDripListQueryVariables>(
    gql`
      ${LIST_EDITOR_DRIP_LIST_FRAGMENT}
      query GetDripList($id: ID!, $chain: SupportedChain!) {
        dripList: dripList(id: $id, chain: $chain) {
          ...ListEditorDripList
          account {
            accountId
          }
        }
      }
    `,
    { id: dripListId, chain: network.gqlName },
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
      query GetProject($url: String!, $chains: [SupportedChain!]!) {
        project: projectByUrl(url: $url, chains: $chains) {
          ...ListEditorProject
          account {
            accountId
          }
        }
      }
    `,
    { url, chains: [network.gqlName] },
  );

  if (!res.project) {
    return null;
  }

  return {
    accountId: res.project.account.accountId,
    project: res.project,
  };
};

export const getOrcid = async (orcidId: string): Promise<RecipientResult> => {
  const res = await query<GetOrcidQuery, GetOrcidQueryVariables>(
    gql`
      ${LIST_EDITOR_ORCID_FRAGMENT}
      query GetOrcid($orcid: String!, $chain: SupportedChain!) {
        orcidLinkedIdentityByOrcid(orcid: $orcid, chain: $chain) {
          ...ListEditorOrcid
          account {
            accountId
          }
        }
      }
    `,
    // TODO: yes, for now it is fetched with the actual ORCID iD
    { orcid: orcidId, chain: network.gqlName },
  );

  let orcidAccount = res.orcidLinkedIdentityByOrcid
  // We don't know about it internally, let's construct a minimal OrcidAccount object
  // to mimic it.
  if (!orcidAccount) {
    // Get the ORCID profile
    const orcid = await fetchOrcid(orcidId, fetch);
    // If we can't fetch the ORCID profile, we're out of luck
    if (!orcid) {
      return null
    }

    const accountId = await orcidIdToAccountId(orcidId);
    orcidAccount = {
      __typename: 'OrcidLinkedIdentity',
      account: {
        __typename: 'RepoDriverAccount',
        accountId: String(accountId),
      },
      chain: network.gqlName,
      orcid: orcid.id,
      isClaimed: false,
      isLinked: false,
    } as NonNullable<GetOrcidQuery['orcidLinkedIdentityByOrcid']>;
  }

  return {
    accountId: orcidAccount.account.accountId,
    orcid: orcidAccount,
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
