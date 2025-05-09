<script lang="ts" context="module">
  export const ECOSYSTEM_BADGE_FRAGMENT = gql`
    fragment EcosystemBadge on EcosystemMainAccount {
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
  import ensStore from '$lib/stores/ens';
  import formatAddress from '$lib/utils/format-address';
  import { gql } from 'graphql-request';
  import type { EcosystemBadgeFragment } from './__generated__/gql.generated';
  import EcosystemAvatar from '../ecosystem-avatar/ecosystem-avatar.svelte';

  export let ecosystem: EcosystemBadgeFragment | undefined;

  export let showOwner = true;
  export let showName = true;
  export let isLinked = true;
  export let showAvatar = true;
  export let avatarSize: 'tiny' | 'small' = 'small';
  export let disabled = false;
  export let outline = false;
  export let linkToNewTab = false;

  // lookup ens name if owner is provided
  $: showOwner && ecosystem && ensStore.lookup(ecosystem.owner.address);
  $: ens = showOwner && ecosystem ? $ensStore[ecosystem.owner.address] : {};
  $: username =
    ens?.name ?? (ecosystem && showOwner && formatAddress(ecosystem.owner.address)) ?? undefined;
</script>

<svelte:element
  this={isLinked ? 'a' : 'div'}
  href={isLinked ? `/app/ecosystems/${ecosystem?.account.accountId}` : undefined}
  tabindex={isLinked ? 0 : -1}
  target={linkToNewTab ? '_blank' : undefined}
  class="ecosystem-badge outline-none flex gap-2 items-center"
  class:disabled
>
  {#if showAvatar}
    <EcosystemAvatar size={avatarSize} {disabled} {outline} />
  {/if}
  <div class="name typo-text text-foreground flex-1 min-w-0 truncate">
    <span>
      {#if username}
        <span class="text-foreground-level-5">{username}/</span>
      {/if}
      {#if !ecosystem}
        <span class="animate-pulse">...</span>
      {:else if showName}
        {ecosystem.name}
      {/if}
    </span>
  </div>
</svelte:element>

<style>
  a.ecosystem-badge:focus-visible .name > span {
    background: var(--color-primary-level-1);
    border-radius: 0.25rem;
  }
</style>
