<script lang="ts">
  import { page } from '$app/state';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import type { BottomNavItems } from './types';

  interface Props {
    items: BottomNavItems;
  }

  let { items }: Props = $props();
</script>

<div class="mobile-nav-overflow">
  {#each items as item}
    {@const active = page.url.pathname === item.href}
    <a class="item" href={item.href} class:active onclick={() => cupertinoPaneStore.closeSheet()}>
      <item.icon
        style="fill: {active ? 'var(--color-primary-level-6)' : 'var(--color-foreground)'}"
      />

      <div class="text">
        <span class="typo-text-bold" style:color="var(--color-foreground)">{item.label}</span>
        {#if item.description}
          <span
            class="typo-text"
            style:color={active
              ? 'var(--color-primary-level-6)'
              : 'var(--color-foreground-level-6)'}>{item.description}</span
          >
        {/if}
      </div>
    </a>
  {/each}
</div>

<style>
  .mobile-nav-overflow {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.5rem;
  }

  .item {
    border: 1px solid var(--color-foreground-level-3);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-radius: 1rem 0 1rem 1rem;
  }

  .item.active {
    border-color: var(--color-primary-level-5);
    background-color: var(--color-primary-level-1);
  }

  .item .text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
</style>
