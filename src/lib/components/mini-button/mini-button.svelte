<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import type { Component } from 'svelte';

  interface Props {
    icon: Component;
    highlight?: boolean;
    label: string;
    open?: boolean;
    id?: string | undefined;
  }

  let { icon, highlight = false, label, open = false, id = undefined }: Props = $props();

  const SvelteComponent = $derived(icon);
</script>

<button class:highlight class:open onclick={bubble('click')} aria-label={label} {id}>
  <SvelteComponent style="fill: var(--color-foreground)" />
</button>

<style>
  button {
    height: 2rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--color-foreground-level-1);
    border-radius: 1rem;
    transition: background 0.3s;
  }

  button:hover,
  button.open {
    background: var(--color-foreground-level-2);
  }

  button.highlight {
    background: var(--color-primary-level-2);
  }
</style>
