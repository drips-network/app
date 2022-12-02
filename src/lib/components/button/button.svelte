<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let variant: 'normal' | 'primary' = 'normal';
  export let icon: typeof SvelteComponent | undefined = undefined;
  export let disabled = false;
  export let ariaLabel: string | undefined = undefined;
</script>

<button
  aria-label={ariaLabel}
  class:with-icon-text={Boolean(icon) && Boolean($$slots.default)}
  class:with-text={Boolean($$slots.default) && !icon}
  class="typo-text-bold"
  {disabled}
  on:click|stopPropagation|preventDefault
  class:primary={variant === 'primary'}
>
  {#if icon}
    <svelte:component this={icon} style="fill: var(--color-foreground)" />
  {/if}
  <slot />
</button>

<style>
  button {
    height: 2rem;
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground);
    min-width: 2rem;
    border-radius: 1rem 0 1rem 1rem;
    color: var(--color-foreground);
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
    user-select: none;
    transition: background-color 0.3s, color 0.3s, transform 0.1s, box-shadow 0.3s, opacity 0.3s;
    white-space: nowrap;
  }

  button.primary {
    background-color: var(--color-primary);
    box-shadow: none;
    color: #fff;
  }

  button.with-icon-text {
    padding: 0 0.75rem 0 0.5rem;
  }

  button.with-text {
    padding: 0 0.75rem;
  }

  button:enabled:hover,
  button:enabled:active {
    background-color: var(--color-foreground-level-2);
  }

  button.primary:enabled:hover,
  button.primary:enabled:active {
    background-color: var(--color-primary-level-6);
  }

  button:focus {
    background-color: var(--color-foreground-level-1);
    box-shadow: inset 0px 0px 0px 2px var(--color-foreground);
  }

  button.primary:focus {
    background-color: var(--color-primary-level-6);
  }

  button:enabled:active {
    transform: scale(0.98);
  }

  button:disabled {
    opacity: 0.5;
  }
</style>
