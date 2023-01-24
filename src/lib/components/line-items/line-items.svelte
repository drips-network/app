<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
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

  export let animateValueChanges = false;
  export let lineItems: LineItems;
</script>

<div class="line-items">
  {#each lineItems as lineItem, index (lineItem.title + lineItem.subtitle + lineItem.symbol)}
    <div
      class="line-item"
      in:fade|local={{ duration: 300 }}
      out:fade|local={{ duration: 300 }}
      animate:flip={{ duration: 300 }}
    >
      <LineItemComponent {animateValueChanges} {...lineItem} />
      {#if index !== lineItems.length - 1}<div class="divider" />{/if}
    </div>
  {/each}
</div>

<style>
  .line-items {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .divider {
    height: 1px;
    background-color: var(--color-foreground);
  }
</style>
