import { gql } from 'graphql-request';
import { DRIP_LIST_BADGE_FRAGMENT } from '../drip-list-badge/drip-list-badge.svelte';
import { PROJECT_AVATAR_FRAGMENT } from '../project-avatar/project-avatar.svelte';
import { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
import type {
  SplitsComponentAddressReceiverFragment,
  SplitsComponentDripListReceiverFragment,
  SplitsComponentProjectReceiverFragment,
} from './__generated__/gql.generated';

export const SPLITS_COMPONENT_PROJECT_SPLITS_FRAGMENT = gql`
  ${PROJECT_AVATAR_FRAGMENT}
  ${DRIP_LIST_BADGE_FRAGMENT}
  fragment SplitsComponentProjectSplits on ProjectData {
    ... on ClaimedProjectData {
      splits {
        dependencies {
          ... on AddressReceiver {
            account {
              address
              driver
            }
            driver
          }
          ... on ProjectReceiver {
            project {
              chainData {
                ...ProjectAvatar
              }
            }
          }
          ... on DripListReceiver {
            dripList {
              ...DripListBadge
            }
            account {
              accountId
              driver
            }
            driver
          }
        }
        maintainers {
          ... on AddressReceiver {
            account {
              address
              driver
            }
            driver
          }
        }
      }
    }
  }
`;

export const SPLITS_COMPONENT_PROJECT_FRAGMENT = gql`
  ${PROJECT_BADGE_FRAGMENT}
  fragment SplitsComponentProject on Project {
    ...ProjectBadge
    source {
      repoName
      ownerName
    }
    isVisible
    chainData {
      ... on ClaimedProjectData {
        chain
        owner {
          address
        }
        color
      }
    }
  }
`;

export const SPLITS_COMPONENT_DRIP_LIST_FRAGMENT = gql`
  fragment SplitsComponentDripList on DripList {
    account {
      accountId
    }
    isVisible
    name
    owner {
      address
    }
  }
`;

export const SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT = gql`
  ${SPLITS_COMPONENT_PROJECT_FRAGMENT}
  fragment SplitsComponentProjectReceiver on ProjectReceiver {
    weight
    project {
      ...SplitsComponentProject
    }
  }
`;

export const SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT = gql`
  ${SPLITS_COMPONENT_DRIP_LIST_FRAGMENT}
  fragment SplitsComponentDripListReceiver on DripListReceiver {
    weight
    dripList {
      chain
      ...SplitsComponentDripList
    }
  }
`;

export const SPLITS_COMPONENT_ADDRESS_RECEIVER_FRAGMENT = gql`
  fragment SplitsComponentAddressReceiver on AddressReceiver {
    weight
    account {
      address
    }
  }
`;

export type SplitsComponentSplitsReceiver =
  | SplitsComponentAddressReceiverFragment
  | SplitsComponentDripListReceiverFragment
  | SplitsComponentProjectReceiverFragment;

export type Splits = (SplitGroup | SplitsComponentSplitsReceiver)[];

export interface SplitGroup {
  __typename: 'SplitGroup';
  list: Splits;
  name?: string;
}
