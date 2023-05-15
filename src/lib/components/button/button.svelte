<script lang="ts">
  import getContrastColor from '$lib/utils/get-contrast-text-color';
  import type { ComponentType } from 'svelte';

  export let variant: 'normal' | 'primary' | 'destructive' | 'ghost' = 'normal';
  export let icon: ComponentType | undefined = undefined;
  export let disabled = false;
  export let ariaLabel: string | undefined = undefined;
  export let size: 'normal' | 'large' = 'normal';

  let buttonEl: HTMLButtonElement;

  $: primaryColor = buttonEl
    ? getComputedStyle(buttonEl).getPropertyValue('--color-primary')
    : undefined;

  $: textColor =
    primaryColor && (variant === 'destructive' || variant === 'primary')
      ? getContrastColor(primaryColor)
      : 'var(--color-foreground)';
</script>

<button
  class="size-{size}"
  bind:this={buttonEl}
  aria-label={ariaLabel}
  {disabled}
  on:click|stopPropagation
>
  <div
    class:with-icon-text={Boolean(icon) && Boolean($$slots.default)}
    class:with-text={Boolean($$slots.default) && !icon}
    class="inner typo-text {variant}"
    style:color={textColor}
  >
    {#if icon}
      <svelte:component
        this={icon}
        style={variant === 'destructive' || variant === 'primary'
          ? `fill: ${textColor}`
          : 'fill: var(--color-foreground)'}
      />
    {/if}
    <slot />
  </div>
</button>

<style>
  button {
    height: calc(2rem + 10px);
    min-width: calc(2rem + 4px); /* so just icons are square (w=h) */
    padding: 5px 2px;
    margin: -4px 0;
    transition: opacity 0.3s;
  }

  button.size-large {
    height: calc(3rem + 10px);
    min-width: calc(3rem + 4px);
  }

  button .inner {
    height: 100%;
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    color: var(--color-foreground);
    user-select: none;
    transition: background-color 0.3s, color 0.3s, transform 0.2s, box-shadow 0.2s, opacity 0.3s;
    background-color: var(--color-background);
  }

  button.size-large .inner {
    border-radius: 1.5rem 0 1.5rem 1.5rem;
  }

  button .inner:not(.ghost) {
    box-shadow: var(--elevation-low);
  }

  button .inner.primary {
    background-color: var(--color-primary);
  }

  button .inner.destructive {
    background-color: var(--color-negative);
  }

  button .inner.with-icon-text {
    padding: 0 0.75rem 0 0.5rem;
  }

  button .inner.with-text {
    padding: 0 0.75rem;
  }

  button:enabled:hover .inner,
  button:enabled:focus-visible .inner {
    box-shadow: 0px 0px 0px 1px var(--color-foreground), 0 2px 0px 1px var(--color-foreground),
      inset 0 0px 0px 0px var(--color-foreground);
    transform: translateY(-2px);
  }

  button:enabled:active .inner {
    transform: translateY(0px);
    box-shadow: 0px 0px 0px 1px var(--color-foreground), 0 0px 0px 0px var(--color-foreground);
  }

  button:focus-visible .inner {
    box-shadow: var(--elevation-low);
  }

  button:focus-visible .inner.normal {
    background-color: var(--color-foreground-level-1);
  }
  button:disabled {
    opacity: 0.5;
  }
</style>
