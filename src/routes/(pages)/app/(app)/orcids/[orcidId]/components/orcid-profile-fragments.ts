import { gql } from 'graphql-request';
import { SUPPORTER_PILE_FRAGMENT } from '$lib/components/drip-list-card/methods/get-supporters-pile';
import { SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT } from '$lib/components/supporters-section/supporters.section.svelte';
import { MERGE_WITHDRAWABLE_BALANCES_FRAGMENT } from '$lib/utils/merge-withdrawable-balances';
import { ORCID_PROFILE_HEADER_FRAGMENT } from './orcid-profile-header.svelte';

// TODO
// withdrawableBalances {
//   ...MergeWithdrawableBalances
// }
// support {
//   ...SupportersSectionSupportItem
//   ...SupporterPile
// }
// totalEarned {
//   tokenAddress
//   amount
// }

export const ORCID_PROFILE_FRAGMENT = gql`
  ${SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT}
  ${SUPPORTER_PILE_FRAGMENT}
  ${MERGE_WITHDRAWABLE_BALANCES_FRAGMENT}
  ${ORCID_PROFILE_HEADER_FRAGMENT}
  fragment OrcidProfile on OrcidLinkedIdentity {
    ...OrcidProfileHeader
    account {
      accountId
      driver
    }
    chain
    owner {
      accountId
    }
  }
`;
