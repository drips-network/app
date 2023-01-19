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

  export let animateValueChanges = false;
  export let lineItems: LineItems;
</script>

<div class="line-items">
  {#each lineItems as lineItem, index}
    <LineItemComponent {animateValueChanges} {...lineItem} />
    {#if index !== lineItems.length - 1}<div class="divider" />{/if}
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
