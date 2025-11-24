<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    style,
  }: {
    children: Snippet;
    style?: string;
  } = $props();
</script>

<div class="card" {style}>
  {@render children()}
</div>

<style>
  .card {
    background-color: var(--color-background);
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground-level-3);
    box-sizing: border-box;
    padding: 1rem;
  }
</style>
