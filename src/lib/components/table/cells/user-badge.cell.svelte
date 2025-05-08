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

  // TODO: ecosystem badge?
  export const USER_BADGE_CELL_ECOSYSTEM_FRAGMENT = gql`
    fragment UserBadgeCellEcosystem on EcosystemMainAccount {
      chain
      account {
        accountId
      }
      name
      owner {
        address
      }
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
    UserBadgeCellEcosystemFragment,
  } from './__generated__/gql.generated';

  export let userOrDripListOrEcosystem:
    | UserBadgeCellUserFragment
    | UserBadgeCellDripListFragment
    | UserBadgeCellEcosystemFragment;
</script>

{#if userOrDripListOrEcosystem.__typename === 'DripList'}
  <DripListBadge
    dripList={userOrDripListOrEcosystem ?? undefined}
    avatarSize="tiny"
    isLinked={false}
    showOwner={true}
  />
{:else if userOrDripListOrEcosystem.__typename === 'EcosystemMainAccount'}
  TODO
{:else}
  <IdentityBadge address={userOrDripListOrEcosystem.account.address} />
{/if}
