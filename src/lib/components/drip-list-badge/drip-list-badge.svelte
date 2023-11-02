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
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import ensStore from '$lib/stores/ens';
  import formatAddress from '$lib/utils/format-address';
  import { gql } from 'graphql-request';
  import type { DripListBadgeFragment } from './__generated__/gql.generated';

  export let dripList: DripListBadgeFragment | undefined;

  export let showOwner = true;
  export let isLinked = true;
  export let showAvatar = true;
  export let avatarSize: 'small' | 'default' = 'default';

  /** Makes the drip list icon grey instead of primary. */
  export let disabled = false;

  // lookup ens name if owner is provided
  $: showOwner && dripList && ensStore.connected && ensStore.lookup(dripList.owner.address);
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
    <div
      class:bg-primary-level-1={!disabled}
      class:bg-foreground-level-2={disabled}
      class="flex items-center justify-center rounded-full flex-shrink-0  {avatarSize === 'small'
        ? 'w-6 h-6'
        : 'w-8 h-8'}"
    >
      <DripListIcon
        style="fill: {disabled
          ? 'var(--color-foreground-level-6)'
          : 'var(--color-primary)'}; {avatarSize === 'small' ? 'width:18px; height:18px;' : ''}"
      />
    </div>
  {/if}
  <div class="name typo-text text-foreground flex-1 min-w-0 truncate">
    <span
      >{#if username}<span class="text-foreground-level-5">{username}/</span
        >{/if}{#if !dripList}<span class="animate-pulse">...</span>{:else}{dripList.name}{/if}</span
    >
  </div>
</svelte:element>

<style>
  a.drip-list-badge:focus-visible .name > span {
    background: var(--color-primary-level-1);
    border-radius: 0.25rem;
  }
</style>
