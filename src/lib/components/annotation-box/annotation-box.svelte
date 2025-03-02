<script lang="ts">
  import WarningIcon from '$lib/components/icons/ExclamationCircle.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import type { ComponentType } from 'svelte';
  export let type: 'warning' | 'info' | 'error' = 'warning';
  export let size: 'normal' | 'small' = 'normal';
  export let icon: ComponentType | undefined = undefined;
</script>

<div
  class="annotation-box typo-text-small {type} {size} flex flex-wrap items-center justify-between gap-3"
>
  <div class="flex gap-2 items-start">
    {#if icon}
      <svelte:component this={icon} style="height: 1.25rem; width: 1.25rem; fill: currentColor" />
    {:else if type === 'warning'}
      <WarningIcon style="height: 1.25rem; width: 1.25rem; fill: var(--color-caution-level-6)" />
    {:else if type === 'info'}
      <InfoCircle style="height: 1.25rem; width: 1.25rem; fill: var(--color-primary-level-6)" />
    {:else}
      <WarningIcon style="height: 1.25rem; width: 1.25rem; fill: var(--color-negative-level-6)" />
    {/if}
    <div class="flex-1 pt-px">
      <slot />
    </div>
  </div>
  {#if $$slots.actions}
    <div class="flex-1 gap-1 flex justify-end">
      <slot name="actions" />
    </div>
  {/if}
</div>

<style>
  .annotation-box {
    border-radius: 1rem 0 1rem 1rem;
    padding: 0.75rem;
    text-align: left;
  }

  .annotation-box.small {
    border-radius: 0.75rem 0 0.75rem 0.75rem;
    padding: 0.5rem;
    border-color: none;
  }

  .annotation-box.warning {
    background-color: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
  }

  .annotation-box.info {
    background-color: var(--color-primary-level-1);
  }

  .annotation-box.error {
    background-color: var(--color-negative-level-1);
    color: var(--color-negative-level-6);
  }
</style>
