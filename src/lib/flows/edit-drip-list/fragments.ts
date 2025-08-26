import { gql } from 'graphql-request';
import {
  SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_ADDRESS_RECEIVER_FRAGMENT,
  SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_DRIP_LIST_RECEIVER_FRAGMENT,
  SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_PROJECT_RECEIVER_FRAGMENT,
  SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_ORCID_RECEIVER_FRAGMENT,
} from '$lib/components/list-editor/utils/split-receivers-to-list-editor-config';
import { DRIP_LIST_BADGE_FRAGMENT } from '$lib/components/drip-list-badge/drip-list-badge.svelte';

export const EDIT_DRIP_LIST_FLOW_DRIP_LIST_FRAGMENT = gql`
  ${SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_ADDRESS_RECEIVER_FRAGMENT}
  ${SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_DRIP_LIST_RECEIVER_FRAGMENT}
  ${SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_PROJECT_RECEIVER_FRAGMENT}
  ${SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_ORCID_RECEIVER_FRAGMENT}
  fragment EditDripListFlowDripList on DripList {
    name
    description
    isVisible
    account {
      accountId
    }
    splits {
      ... on DripListReceiver {
        ...SplitReceiversToListEditorConfigDripListReceiver
      }
      ... on AddressReceiver {
        ...SplitReceiversToListEditorConfigAddressReceiver
      }
      ... on ProjectReceiver {
        ...SplitReceiversToListEditorConfigProjectReceiver
      }
      ... on LinkedIdentityReceiver {
        ...SplitReceiversToListEditorConfigOrcidReceiver
      }
    }
  }
`;

export const SELECT_DRIP_LIST_STEP_LISTS_FRAGMENT = gql`
  ${DRIP_LIST_BADGE_FRAGMENT}
  ${EDIT_DRIP_LIST_FLOW_DRIP_LIST_FRAGMENT}
  fragment SelectDripListStepLists on DripList {
    ...DripListBadge
    ...EditDripListFlowDripList
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
      ... on EcosystemMainAccountReceiver {
        account {
          accountId
        }
      }
      ... on SubListReceiver {
        account {
          accountId
        }
      }
      ... on LinkedIdentityReceiver {
        account {
          accountId
        }
      }
    }
  }
`;

export const SELECT_DRIP_LIST_PROJECT_TO_ADD_FRAGMENT = gql`
  fragment SelectDripListProjectToAdd on Project {
    account {
      accountId
    }
    source {
      url
    }
  }
`;

export const SELECT_DRIP_LIST_DRIP_LIST_TO_ADD_FRAGMENT = gql`
  fragment SelectDripListDripListToAdd on DripList {
    account {
      accountId
    }
  }
`;

export const SELECT_DRIP_LIST_ORCID_TO_ADD_FRAGMENT = gql`
  fragment SelectDripListOrcidToAdd on OrcidLinkedIdentity {
    account {
      accountId
    }
  }
`;
