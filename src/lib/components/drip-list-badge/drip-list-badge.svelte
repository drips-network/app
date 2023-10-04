<script lang="ts">
  import DripListIcon from 'radicle-design-system/icons/DripList.svelte';
  import ensStore from '$lib/stores/ens';
  import formatAddress from '$lib/utils/format-address';

  export let listId: string;
  export let listName: string | undefined = undefined;
  export let owner: string | undefined = undefined;

  export let isLinked = true;
  export let showAvatar = true;
  export let avatarSize: 'small' | 'default' = 'default';

  // lookup ens name if owner is provided
  $: owner && ensStore.connected && ensStore.lookup(owner);
  $: ens = owner ? $ensStore[owner] : {};
  $: username = ens?.name || (owner && formatAddress(owner));
</script>

<svelte:element
  this={isLinked ? 'a' : 'div'}
  href={isLinked ? `/app/drip-lists/${listId}` : undefined}
  tabindex={isLinked ? 0 : -1}
  class="drip-list-badge outline-none flex gap-2 items-center"
>
  {#if showAvatar}
    <div
      class="flex items-center justify-center rounded-full flex-shrink-0 bg-primary-level-1 {avatarSize ===
      'small'
        ? 'w-6 h-6'
        : 'w-8 h-8'}"
    >
      <DripListIcon
        style="fill: var(--color-primary); {avatarSize === 'small'
          ? 'width:18px; height:18px;'
          : ''}"
      />
    </div>
  {/if}
  {#if listName}
    <div class="name typo-text text-foreground flex-1 min-w-0 truncate">
      <span
        >{#if username}<span class="text-foreground-level-5">{username}/</span
          >{/if}{@html listName}</span
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
