<script lang="ts">
  import type { Component } from 'svelte';

  interface Props {
    icon: Component;
    children?: import('svelte').Snippet;
  }

  let { icon, children }: Props = $props();

  const SvelteComponent = $derived(icon);
</script>

<div class="solution-line-item">
  <SvelteComponent />
  {@render children?.()}
</div>

<style>
  .solution-line-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }
</style>
