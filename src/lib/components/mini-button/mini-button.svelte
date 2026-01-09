<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import type { Component } from 'svelte';
  import { scale } from 'svelte/transition';

  interface Props {
    icon: Component;
    highlight?: boolean;
    label: string;
    open?: boolean;
    id?: string | undefined;
    redNumber?: number | null;
    onclick?: () => void;
  }

  let {
    icon,
    highlight = false,
    label,
    open = false,
    id = undefined,
    redNumber = null,
    onclick = undefined,
  }: Props = $props();

  const SvelteComponent = $derived(icon);
</script>

<button
  class:highlight
  class:open
  onclick={() => {
    bubble('click');
    if (onclick) {
      onclick();
    }
  }}
  aria-label={label}
  {id}
>
  <SvelteComponent style="fill: var(--color-foreground)" />
  {#if redNumber && redNumber > 0}
    <div
      transition:scale={{ duration: 300 }}
      class="red-number tnum"
      class:hidden={redNumber === 0}
    >
      {redNumber > 99 ? '99+' : redNumber}
    </div>
  {/if}
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

  .red-number {
    position: absolute;
    top: -2px;
    right: -2px;
    height: 1rem;
    min-width: 1rem;
    width: fit-content;
    background: red;
    color: white;
    border-radius: 0.5rem;
    padding: 3px;
    font-size: 0.8em;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    pointer-events: none;
    font-size: 0.625rem;
  }
</style>
