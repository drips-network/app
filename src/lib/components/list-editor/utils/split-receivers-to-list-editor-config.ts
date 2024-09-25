import { gql } from 'graphql-request';
import {
  LIST_EDITOR_DRIP_LIST_FRAGMENT,
  LIST_EDITOR_PROJECT_FRAGMENT,
  type ListEditorItem,
} from '../types';
import type {
  SplitReceiversToListEditorConfigAddressReceiverFragment,
  SplitReceiversToListEditorConfigDripListReceiverFragment,
  SplitReceiversToListEditorConfigProjectReceiverFragment,
} from './__generated__/gql.generated';

export const SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_DRIP_LIST_RECEIVER_FRAGMENT = gql`
  ${LIST_EDITOR_DRIP_LIST_FRAGMENT}
  fragment SplitReceiversToListEditorConfigDripListReceiver on DripListReceiver {
    weight
    dripList {
      ...ListEditorDripList
      account {
        accountId
      }
    }
  }
`;

export const SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_PROJECT_RECEIVER_FRAGMENT = gql`
  ${LIST_EDITOR_PROJECT_FRAGMENT}
  fragment SplitReceiversToListEditorConfigProjectReceiver on ProjectReceiver {
    weight
    project {
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
`;

export const SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_ADDRESS_RECEIVER_FRAGMENT = gql`
  fragment SplitReceiversToListEditorConfigAddressReceiver on AddressReceiver {
    weight
    account {
      accountId
      address
    }
  }
`;

type SplitReceiver =
  | SplitReceiversToListEditorConfigAddressReceiverFragment
  | SplitReceiversToListEditorConfigDripListReceiverFragment
  | SplitReceiversToListEditorConfigProjectReceiverFragment;

function mapSplitReceiverToEditorItem(input: SplitReceiver): ListEditorItem {
  switch (input.__typename) {
    case 'AddressReceiver':
      return { type: 'address', address: input.account.address };
    case 'DripListReceiver':
      return { type: 'drip-list', dripList: input.dripList };
    case 'ProjectReceiver':
      return { type: 'project', project: input.project };
  }
}

function extractAccountId(input: SplitReceiver) {
  switch (input.__typename) {
    case 'AddressReceiver':
      return input.account.accountId;
    case 'DripListReceiver':
      return input.dripList.account.accountId;
    case 'ProjectReceiver':
      return input.project.account.accountId;
  }
}

export function mapSplitReceiversToEditorConfig(input: SplitReceiver[]) {
  return {
    items: Object.fromEntries(
      input.map((v) => [extractAccountId(v), mapSplitReceiverToEditorItem(v)]),
    ),
    weights: Object.fromEntries(input.map((v) => [extractAccountId(v), v.weight])),
  };
}
