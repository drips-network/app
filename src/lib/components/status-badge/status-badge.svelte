<script lang="ts">
  import type { ComponentType } from 'svelte';

  export let size: 'small' | 'normal' | 'large' = 'normal';
  export let color: 'caution' | 'positive' | 'foreground' | 'negative' | 'primary' = 'foreground';
  export let icon: ComponentType | undefined = undefined;

  const textClasses = {
    small: 'typo-text-small',
    normal: 'typo-text',
    large: 'typo-header-3',
  };
</script>

<div class="status-badge {size}" style:background-color={`var(--color-${color}-level-1`}>
  {#if icon}
    <svelte:component
      this={icon}
      style="fill: var(--color-{color}-level-6); width:18px; height:18px"
    />
  {:else}
    <div class="dot" style:background-color={`var(--color-${color}-level-6)`} />
  {/if}
  <span class={textClasses[size]} style:color={`var(--color-${color}-level-6)`}><slot /></span>
</div>

<style>
  .status-badge {
    height: 2rem;
    border-radius: 2rem 0 2rem 2rem;
    display: flex;
    gap: 0.5rem;
    padding: 0 0.75rem;
    align-items: center;
    user-select: none;
    max-width: fit-content;
    white-space: nowrap;
  }

  .status-badge.small {
    height: 1.5rem;
    padding: 0 0.5rem;
    gap: 0.375rem;
  }

  .status-badge.large {
    height: 3rem;
    padding: 0 1rem;
    gap: 0.5rem;
  }

  .dot {
    height: 0.5rem;
    width: 0.5rem;
    border-radius: 0.25rem;
  }

  .small .dot {
    height: 0.375rem;
    width: 0.375rem;
  }
</style>
