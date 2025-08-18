<script lang="ts" context="module">
  // TODO: may have to differentiate these
  import { SUPPORTER_PILE_FRAGMENT } from '$lib/components/drip-list-card/methods/get-supporters-pile';
  import { SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT } from '$lib/components/supporters-section/supporters.section.svelte';
  import { MERGE_WITHDRAWABLE_BALANCES_FRAGMENT } from '$lib/utils/merge-withdrawable-balances';
  import { gql } from 'graphql-request';

  export const ORCID_PROFILE_FRAGMENT = gql`
    ${SUPPORTERS_SECTION_SUPPORT_ITEM_FRAGMENT}
    ${SUPPORTER_PILE_FRAGMENT}
    ${MERGE_WITHDRAWABLE_BALANCES_FRAGMENT}
    fragment OrcidProfile on OrcidAccount {
      account {
        accountId
        driver
      }
      source {
        url
      }
      chainData {
        ... on UnClaimedOrcidAccountData {
          linkedTo {
            accountId
          }
          support {
            ...SupportersSectionSupportItem
            ...SupporterPile
          }
          withdrawableBalances {
            ...MergeWithdrawableBalances
          }
        }
        ... on ClaimedOrcidAccountData {
          maybeLinkedTo: linkedTo {
            accountId
          }
          support {
            ...SupportersSectionSupportItem
            ...SupporterPile
          }
          totalEarned {
            tokenAddress
            amount
          }
        }
      }
    }
  `;
</script>

<script lang="ts">
</script>

<div>Hello World</div>
