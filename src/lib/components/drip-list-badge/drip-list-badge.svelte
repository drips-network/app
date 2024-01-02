<script lang="ts" context="module">
  export const DRIP_LIST_BADGE_FRAGMENT = gql`
    fragment DripListBadge on DripList {
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
  import ensStore from '$lib/stores/ens';
  import formatAddress from '$lib/utils/format-address';
  import { gql } from 'graphql-request';
  import type { DripListBadgeFragment } from './__generated__/gql.generated';
  import DripListAvatar from '../drip-list-avatar/drip-list-avatar.svelte';

  export let dripList: DripListBadgeFragment | undefined;

  export let showOwner = true;
  export let showName = true;
  export let isLinked = true;
  export let showAvatar = true;
  export let avatarSize: 'tiny' | 'small' = 'small';
  export let disabled = false;

  const ensConnected = ensStore.connected;

  // lookup ens name if owner is provided
  $: showOwner && dripList && $ensConnected && ensStore.lookup(dripList.owner.address);
  $: ens = showOwner && dripList ? $ensStore[dripList.owner.address] : {};
  $: username =
    ens?.name ?? (dripList && showOwner && formatAddress(dripList.owner.address)) ?? undefined;
</script>

<svelte:element
  this={isLinked ? 'a' : 'div'}
  href={isLinked ? `/app/drip-lists/${dripList?.account.accountId}` : undefined}
  tabindex={isLinked ? 0 : -1}
  class="drip-list-badge outline-none flex gap-2 items-center"
  class:disabled
>
  {#if showAvatar}
    <DripListAvatar size={avatarSize} {disabled} />
  {/if}
  {#if showName}
    <div class="name typo-text text-foreground flex-1 min-w-0 truncate">
      <span
        >{#if username}<span class="text-foreground-level-5">{username}/</span
          >{/if}{#if !dripList}<span class="animate-pulse">...</span
          >{:else}{dripList.name}{/if}</span
      >
    </div>
  {/if}
</svelte:element>

<style>
  a.drip-list-badge:focus-visible .name > span {
    background: var(--color-primary-level-1);
    border-radius: 0.25rem;
  }
</style>
