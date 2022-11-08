<script lang="ts">
  import LineItemComponent from './components/line-item.svelte';

  interface LineItem {
    title: string;
    subtitle?: string;
    value: string;
    symbol: string;
    highlight?: boolean;
    disabled?: boolean;
  }

  type LineItems = LineItem[];

  export let lineItems: LineItems;
</script>

<div class="line-items">
  {#each lineItems as lineItem, index}
    <LineItemComponent {...lineItem} />
    {#if index !== lineItems.length - 1}<div class="divider" />{/if}
  {/each}
</div>

<style>
  .line-items {
    display: flex;
    flex-direction: column;
    border: 2px solid var(--color-foreground-level-2);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .divider {
    height: 2px;
    background-color: var(--color-foreground-level-1);
  }
</style>
