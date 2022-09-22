<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let icon: typeof SvelteComponent | undefined = undefined;
  export let disabled = false;
  export let ariaLabel: string | undefined = undefined;
</script>

<button aria-label={ariaLabel} class:with-icon={Boolean(icon)} {disabled} on:click|stopPropagation>
  {#if icon}
    <svelte:component this={icon} style="fill: var(--color-foreground-level-6)" />
  {/if}
  <span class="typo-text-bold"><slot /></span>
</button>

<style>
  button {
    height: 2rem;
    border-radius: 1rem;
    background-color: var(--color-foreground-level-2);
    color: var(--color-foreground-level-6);
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 0 0.75rem;
    box-sizing: border-box;
    border: 2px solid rgba(0, 0, 0, 0);
    user-select: none;
    transition: background-color 0.3s, color 0.3s, transform 0.1s, border 0.3s;
  }

  button.with-icon {
    padding: 0 0.75rem 0 0.5rem;
  }

  button:enabled:hover,
  button:enabled:active {
    background-color: var(--color-foreground-level-3);
  }

  button:focus {
    border: 2px solid var(--color-foreground-level-4);
    outline: none;
  }

  button:enabled:active {
    transform: scale(0.98);
  }

  button:disabled {
    opacity: 0.5;
  }
</style>
