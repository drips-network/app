<script lang="ts">
  import type { ComponentType } from 'svelte';

  export let icon: ComponentType;
  export let highlight = false;

  export let open = false;
</script>

<button class:highlight class:open on:click>
  <svelte:component this={icon} style="fill: var(--color-foreground)" />
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
  }

  button:hover,
  button.open {
    background: var(--color-foreground-level-2);
  }

  button.highlight {
    background: var(--color-primary-level-2);
  }
</style>
