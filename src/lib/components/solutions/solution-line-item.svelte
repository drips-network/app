<script lang="ts">
  import type { ComponentType } from 'svelte';

  export let icon: ComponentType;
</script>

<div class="solution-line-item">
  <svelte:component this={icon} />
  <slot></slot>
</div>

<style>
  .solution-line-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .solution-line-item > * {
    flex-shrink: 0;
  }
</style>
