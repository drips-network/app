import { gql } from 'graphql-request';
import {
  LIST_EDITOR_DRIP_LIST_FRAGMENT,
  LIST_EDITOR_ECOSYSTEM_FRAGMENT,
  // LIST_EDITOR_ORCID_FRAGMENT,
  LIST_EDITOR_PROJECT_FRAGMENT,
  LIST_EDITOR_SUB_LIST_FRAGMENT,
  type ListEditorItem,
} from '../types';
import type {
  SplitReceiversToListEditorConfigAddressReceiverFragment,
  SplitReceiversToListEditorConfigDripListReceiverFragment,
  SplitReceiversToListEditorConfigProjectReceiverFragment,
  SplitReceiversToListEditorConfigEcosystemReceiverFragment,
  SplitReceiversToListEditorConfigSubListReceiverFragment,
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
      account {
        accountId
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

export const SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_ECOSYSTEM_RECEIVER_FRAGMENT = gql`
  ${LIST_EDITOR_ECOSYSTEM_FRAGMENT}
  fragment SplitReceiversToListEditorConfigEcosystemReceiver on EcosystemMainAccountReceiver {
    weight
    account {
      accountId
    }
    ecosystemMainAccount {
      ...ListEditorEcosystem
      account {
        accountId
      }
    }
  }
`;

export const SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_SUB_LIST_RECEIVER_FRAGMENT = gql`
  ${LIST_EDITOR_SUB_LIST_FRAGMENT}
  fragment SplitReceiversToListEditorConfigSubListReceiver on SubListReceiver {
    weight
    account {
      accountId
    }
    subList {
      ...ListEditorSubList
      account {
        accountId
      }
    }
  }
`;

// export const SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_ORCID_RECEIVER_FRAGMENT = gql`
//   ${LIST_EDITOR_ORCID_FRAGMENT}
//   fragment SplitReceiversToListEditorConfigOrcidReceiver on OrcidReceiver {
//     weight
//     orcidAccount {
//       ...ListEditorOrcid
//       account {
//         accountId
//       }
//     }
//   }
// `;

// cannot yet split to an ecosystem
export type SplitReceiver =
  | SplitReceiversToListEditorConfigAddressReceiverFragment
  | SplitReceiversToListEditorConfigDripListReceiverFragment
  | SplitReceiversToListEditorConfigProjectReceiverFragment
  | SplitReceiversToListEditorConfigEcosystemReceiverFragment
  | SplitReceiversToListEditorConfigSubListReceiverFragment;

function mapSplitReceiverToEditorItem(input: SplitReceiver): ListEditorItem {
  switch (input.__typename) {
    case 'AddressReceiver':
      return { type: 'address', address: input.account.address };
    case 'DripListReceiver':
      return { type: 'drip-list', dripList: input.dripList };
    case 'ProjectReceiver':
      return { type: 'project', project: input.project };
    case 'EcosystemMainAccountReceiver':
      return { type: 'ecosystem', ecosystem: input.ecosystemMainAccount };
    case 'SubListReceiver':
      return { type: 'subList', subList: input.subList };
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
    case 'EcosystemMainAccountReceiver':
      return input.ecosystemMainAccount.account.accountId;
    case 'SubListReceiver':
      return input.subList.account.accountId;
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
