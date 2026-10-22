import { gql } from 'graphql-request';
import { PROJECT_AVATAR_FRAGMENT } from '../project-avatar/project-avatar.svelte';
import { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
import type {
  SplitsComponentAddressReceiverFragment,
  SplitsComponentDripListReceiverFragment,
  SplitsComponentProjectReceiverFragment,
  SplitsComponentOrcidReceiverFragment,
} from './__generated__/gql.generated';
import { DRIP_LIST_BADGE_FRAGMENT } from '../drip-list-badge/drip-list-badge.svelte';

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
  ${DRIP_LIST_BADGE_FRAGMENT}
  fragment SplitsComponentDripList on DripList {
    ...DripListBadge
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

export const SPLITS_COMPONENT_ORCID_RECEIVER_FRAGMENT = gql`
  fragment SplitsComponentOrcidReceiver on LinkedIdentityReceiver {
    weight
    linkedIdentity {
      ... on OrcidLinkedIdentity {
        chain
        isClaimed
        areSplitsValid
        account {
          accountId
        }
        orcid
        owner {
          address
        }
        orcidMetadata {
          givenName
          familyName
        }
      }
    }
  }
`;

export const SPLITS_COMPONENT_PROJECT_SPLITS_FRAGMENT = gql`
  ${PROJECT_AVATAR_FRAGMENT}
  ${SPLITS_COMPONENT_PROJECT_RECEIVER_FRAGMENT}
  ${SPLITS_COMPONENT_DRIP_LIST_RECEIVER_FRAGMENT}
  ${SPLITS_COMPONENT_ADDRESS_RECEIVER_FRAGMENT}
  ${SPLITS_COMPONENT_ORCID_RECEIVER_FRAGMENT}
  fragment SplitsComponentProjectSplits on ProjectData {
    ... on ClaimedProjectData {
      splits {
        dependencies {
          ... on AddressReceiver {
            ...SplitsComponentAddressReceiver
          }
          ... on ProjectReceiver {
            ...SplitsComponentProjectReceiver
          }
          ... on DripListReceiver {
            ...SplitsComponentDripListReceiver
          }
          ... on LinkedIdentityReceiver {
            ...SplitsComponentOrcidReceiver
          }
        }
        maintainers {
          ... on AddressReceiver {
            ...SplitsComponentAddressReceiver
          }
        }
      }
    }
  }
`;

export type SplitsComponentSplitsReceiver =
  | SplitsComponentAddressReceiverFragment
  | SplitsComponentDripListReceiverFragment
  | SplitsComponentProjectReceiverFragment
  | SplitsComponentOrcidReceiverFragment;

const SUPPORTED_SPLITS_RECEIVER_TYPENAMES = [
  'AddressReceiver',
  'DripListReceiver',
  'ProjectReceiver',
  'LinkedIdentityReceiver',
] as const satisfies SplitsComponentSplitsReceiver['__typename'][];

/**
 * The API may return split receiver types the app no longer supports. Use this to filter them out
 * before rendering or editing a list of splits.
 */
export function isSupportedSplitsReceiver<T extends { __typename: string }>(
  receiver: T,
): receiver is Extract<T, { __typename: (typeof SUPPORTED_SPLITS_RECEIVER_TYPENAMES)[number] }> {
  return (SUPPORTED_SPLITS_RECEIVER_TYPENAMES as readonly string[]).includes(receiver.__typename);
}

export type Splits = (SplitGroup | SplitsComponentSplitsReceiver)[];

export interface SplitGroup {
  __typename: 'SplitGroup';
  list: Splits;
  name?: string;
}
