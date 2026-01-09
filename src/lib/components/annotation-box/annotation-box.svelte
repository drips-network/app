<script lang="ts">
  import WarningIcon from '$lib/components/icons/ExclamationCircle.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import type { Component } from 'svelte';
  interface Props {
    type?: 'warning' | 'info' | 'error';
    size?: 'normal' | 'small';
    overlay?: boolean;
    icon?: Component | undefined;
    children?: import('svelte').Snippet;
    actions?: import('svelte').Snippet;
    centered?: boolean;
  }

  let {
    type = 'warning',
    size = 'normal',
    overlay = false,
    icon = undefined,
    children,
    actions,
    centered = false,
  }: Props = $props();
</script>

<div class="annotation-box typo-text-small {type} {size}" class:centered class:overlay>
  <div class="content-wrapper">
    <div class="icon-container">
      {#if icon}
        {@const SvelteComponent = icon}
        <SvelteComponent style="height: 1.25rem; width: 1.25rem; fill: currentColor" />
      {:else if type === 'warning'}
        <WarningIcon style="height: 1.25rem; width: 1.25rem; fill: var(--color-caution-level-6)" />
      {:else if type === 'info'}
        <InfoCircle style="height: 1.25rem; width: 1.25rem; fill: var(--color-primary-level-6)" />
      {:else}
        <WarningIcon style="height: 1.25rem; width: 1.25rem; fill: var(--color-negative-level-6)" />
      {/if}
    </div>

    <div class="text-wrapper">
      {@render children?.()}
    </div>
  </div>

  {#if actions}
    <div class="actions-wrapper">
      {@render actions?.()}
    </div>
  {/if}
</div>

<style>
  .annotation-box {
    border-radius: 1rem 0 1rem 1rem;
    padding: 0.75rem;
    text-align: left;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .content-wrapper {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .text-wrapper {
    flex: 1;
    padding-top: 1px;
  }

  .actions-wrapper {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    gap: 0.25rem;
  }

  /* Centered Modifications */
  .annotation-box.centered {
    text-align: center;
    flex-direction: column;
    justify-content: center;
  }

  .annotation-box.centered .content-wrapper {
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .annotation-box.centered .text-wrapper {
    padding-top: 0;
  }

  .annotation-box.centered .actions-wrapper {
    justify-content: center;
    width: 100%;
    flex: initial;
  }

  /* Theme Variants */
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

  .annotation-box.overlay {
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground);
  }

  .icon-container {
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
</style>
