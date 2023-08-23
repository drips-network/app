<script lang="ts">
  import Ledger from 'radicle-design-system/icons/Ledger.svelte';
  import ensStore from '$lib/stores/ens';
  import formatAddress from '$lib/utils/format-address';

  export let listName: string;
  export let listId: string;
  export let owner: string;

  export let showAvatar = true;
  export let showName = true;
  export let isLinked = true;

  $: ensStore.connected && ensStore.lookup(owner);
  $: ens = $ensStore[owner];

  $: username = ens?.name ? ens.name : formatAddress(owner);
</script>

<svelte:element
  this={isLinked ? 'a' : 'div'}
  href={isLinked ? `/app/drip-lists/{listId}` : undefined}
  tabindex={isLinked ? 0 : -1}
  class="drip-list-badge flex gap-2 items-center"
>
  {#if showAvatar}
    <div class="drip-list-icon">
      <Ledger style="fill: var(--color-primary)" />
    </div>
  {/if}
  {#if showName}
    <div class="name typo-text text-foreground flex-1 min-w-0 truncate">
      <span><span class="text-foreground-level-5">{username}/</span>{listName}</span>
    </div>
  {/if}
</svelte:element>

<style>
  .drip-list-icon {
    background-color: var(--color-primary-level-1);
    height: 2rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 1rem;
    flex-shrink: 0;
  }

  a.drip-list-badge {
    outline: none;
  }
  a.drip-list-badge:focus-visible .name > span {
    background: var(--color-primary-level-1);
    border-radius: 0.25rem;
  }
</style>
