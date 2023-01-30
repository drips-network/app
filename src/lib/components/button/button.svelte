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
  <div class="inner">
    {#if icon}
      <svelte:component
        this={icon}
        style={variant === 'destructive' || variant === 'primary'
          ? 'fill: white'
          : 'fill: var(--color-foreground)'}
      />
    {/if}
    <slot />
  </div>
</button>

<style>
  button {
    height: 2rem;
    min-width: 2rem;
    border-radius: 1rem 0 1rem 1rem;
    color: var(--color-foreground);
    user-select: none;
    transition: background-color 0.3s, color 0.3s, transform 0.2s, box-shadow 0.2s, opacity 0.3s;
  }

  button .inner {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    transition: transform 0.2s;
  }

  button:not(.ghost) {
    box-shadow: var(--elevation-low);
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

  button:enabled:hover,
  button:enabled:focus {
    box-shadow: 0px 0px 0px 1px var(--color-foreground), 0 2px 0px 1px var(--color-foreground),
      inset 0 0px 0px 0px var(--color-foreground);
    transform: translateY(-2px);
  }

  button:enabled:active {
    transform: translateY(0px);
    box-shadow: 0px 0px 0px 1px var(--color-foreground), 0 0px 0px 0px var(--color-foreground),
      inset 0 2px 0px 0px var(--color-foreground);
  }

  button:enabled:active .inner {
    transform: translateY(2px);
  }

  button:focus {
    box-shadow: var(--elevation-low);
  }

  button.normal:focus {
    background-color: var(--color-foreground-level-1);
  }
  button:disabled {
    opacity: 0.5;
  }
</style>
