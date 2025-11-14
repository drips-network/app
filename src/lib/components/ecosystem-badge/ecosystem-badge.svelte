<script lang="ts" module>
  export const ECOSYSTEM_BADGE_FRAGMENT = gql`
    ${ECOSYSTEM_AVATAR_FRAGMENT}
    fragment EcosystemBadge on EcosystemMainAccount {
      chain
      account {
        accountId
      }
      name
      owner {
        address
      }
      ...EcosystemAvatar
    }
  `;
</script>

<script lang="ts">
  import { run } from 'svelte/legacy';

  import ensStore from '$lib/stores/ens';
  import formatAddress from '$lib/utils/format-address';
  import { gql } from 'graphql-request';
  import type { EcosystemBadgeFragment } from './__generated__/gql.generated';
  import EcosystemAvatar, {
    ECOSYSTEM_AVATAR_FRAGMENT,
  } from '../ecosystem-avatar/ecosystem-avatar.svelte';


  interface Props {
    ecosystem: EcosystemBadgeFragment | undefined;
    showOwner?: boolean;
    showName?: boolean;
    isLinked?: boolean;
    showAvatar?: boolean;
    avatarSize?: 'tiny' | 'small';
    disabled?: boolean;
    outline?: boolean;
    linkToNewTab?: boolean;
  }

  let {
    ecosystem,
    showOwner = true,
    showName = true,
    isLinked = true,
    showAvatar = true,
    avatarSize = 'small',
    disabled = false,
    outline = false,
    linkToNewTab = false
  }: Props = $props();

  // lookup ens name if owner is provided
  run(() => {
    showOwner && ecosystem && ensStore.lookup(ecosystem.owner.address);
  });
  let ens = $derived(showOwner && ecosystem ? $ensStore[ecosystem.owner.address] : {});
  let username =
    $derived(ens?.name ?? (ecosystem && showOwner && formatAddress(ecosystem.owner.address)) ?? undefined);
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
    <EcosystemAvatar size={avatarSize} {ecosystem} {disabled} {outline} />
  {/if}
  <div class="name typo-text text-foreground flex-1 min-w-0 truncate">
    <span>
      {#if username}
        <span class="text-foreground-level-5">{username}/</span>{/if}{#if !ecosystem}
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
