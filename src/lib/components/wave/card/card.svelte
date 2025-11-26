<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    style,
    disabled,
  }: {
    children: Snippet;
    style?: string;
    disabled?: boolean;
  } = $props();
</script>

<div class="card" class:disabled {style}>
  {@render children()}
</div>

<style>
  .card {
    flex: 1;
    height: 100%;
    background-color: var(--color-background);
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground-level-3);
    box-sizing: border-box;
    padding: 1rem;
    overflow: hidden;
    transition: opacity 0.2s ease-in-out;
  }

  .card.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
