<script lang="ts">
  import Toggle from '$lib/components/toggle/toggle.svelte';

  export let hiddenItemsCount: number;
  export let showHidden: boolean = false;
  export let message = 'Show hidden';
</script>

{#if hiddenItemsCount}
  <div class="visibility-toggle">
    <Toggle bind:checked={showHidden} />
    <p>{message}</p>
    <div class="count"><span>{hiddenItemsCount}</span></div>
  </div>
{/if}

<style>
  .visibility-toggle {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .count {
    font-weight: bold;
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    background-color: var(--color-foreground-level-2);
  }

  .count span {
    padding: 0.5rem 0.5rem;
  }
</style>
