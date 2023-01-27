<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let variant: 'normal' | 'primary' | 'destructive' | 'ghost' = 'normal';
  export let icon: typeof SvelteComponent | undefined = undefined;
  export let disabled = false;
  export let ariaLabel: string | undefined = undefined;
</script>

<button
  aria-label={ariaLabel}
  class:with-icon-text={Boolean(icon) && Boolean($$slots.default)}
  class:with-text={Boolean($$slots.default) && !icon}
  class="typo-text-bold {variant}"
  {disabled}
  on:click|stopPropagation
>
  {#if icon}
    <svelte:component
      this={icon}
      style={variant === 'destructive' || variant === 'primary'
        ? 'fill: white'
        : 'fill: var(--color-foreground)'}
    />
  {/if}
  <slot />
</button>

<style>
  button {
    height: 2rem;
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
    background-color: var(--color-background);
  }

  button.normal {
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground);
  }

  button.primary {
    background-color: var(--color-primary);
    color: #fff;
  }

  button.destructive {
    background-color: var(--color-negative);
    color: #fff;
  }

  button.with-icon-text {
    padding: 0 0.75rem 0 0.5rem;
  }

  button.with-text {
    padding: 0 0.75rem;
  }

  button.normal:enabled:hover,
  button.normal:enabled:active {
    background-color: var(--color-foreground-level-2);
  }

  button:enabled:hover,
  button:enabled:active {
    box-shadow: inset 0px 0px 0px 2px var(--color-foreground);
  }

  button:focus {
    box-shadow: inset 0px 0px 0px 2.5px var(--color-foreground);
  }

  button.normal:focus {
    background-color: var(--color-foreground-level-1);
  }
  button:enabled:active {
    transform: scale(0.98);
  }

  button:disabled {
    opacity: 0.5;
  }
</style>
