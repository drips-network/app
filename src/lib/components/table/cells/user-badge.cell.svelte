<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const USER_BADGE_CELL_USER_FRAGMENT = gql`
    fragment UserBadgeCellUser on User {
      account {
        accountId
        address
        driver
      }
    }
  `;

  export const USER_BADGE_CELL_DRIP_LIST_FRAGMENT = gql`
    ${DRIP_LIST_BADGE_FRAGMENT}
    fragment UserBadgeCellDripList on DripList {
      ...DripListBadge
    }
  `;
</script>

<script lang="ts">
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import DripListBadge, {
    DRIP_LIST_BADGE_FRAGMENT,
  } from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import type {
    UserBadgeCellDripListFragment,
    UserBadgeCellUserFragment,
  } from './__generated__/gql.generated';

  export let userOrDripList: UserBadgeCellUserFragment | UserBadgeCellDripListFragment;
</script>

{#if userOrDripList.__typename === 'DripList'}
  <DripListBadge
    dripList={userOrDripList ?? undefined}
    avatarSize="tiny"
    isLinked={false}
    showOwner={true}
  />
{:else}
  <IdentityBadge address={userOrDripList.account.address} />
{/if}
