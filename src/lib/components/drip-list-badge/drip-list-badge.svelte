<script lang="ts">
  import Ledger from 'radicle-design-system/icons/Ledger.svelte';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';

  export let listName: string;
  export let listId: string;
  export let owner: string | undefined = undefined;

  export let showAvatar = true;
  export let showName = true;
</script>

<a href="/app/drip-lists/{listId}" tabindex="-1" class="drip-list-badge">
  {#if showAvatar}
    <div class="drip-list-icon">
      <Ledger style="fill: var(--color-background)" />
    </div>
  {/if}
  {#if showName}
    <div class="name">
      {#if owner}
        <span>
          <IdentityBadge muted showAvatar={false} address={owner} />
        </span>
      {/if}
      <span class="typo-text">/</span>
      <a class="typo-text-bold" href="/app/drip-lists/{listId}">{listName}</a>
    </div>
  {/if}
</a>

<style>
  .drip-list-badge {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .drip-list-icon {
    background-color: var(--color-foreground);
    height: 2rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 1rem;
  }

  .name {
    display: flex;
    gap: 0;
    align-items: last-baseline;
  }

  .name a:focus {
    outline: none;
  }

  .name a:focus-visible {
    background-color: var(--color-primary-level-1);
    border-radius: 0.25rem;
  }

  .name > span {
    display: inline-block;
  }
</style>
