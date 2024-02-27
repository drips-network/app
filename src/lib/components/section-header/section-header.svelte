<script lang="ts">
  import type { ComponentType } from 'svelte';
  import Button from '../button/button.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import ChevronUp from '$lib/components/icons/ChevronUp.svelte';

  export let icon: ComponentType | undefined = undefined;
  export let label: string;
  export let actions: {
    handler: (event: MouseEvent) => void;
    label?: string;
    icon?: ComponentType;
    variant?: 'primary';
  }[] = [];
  export let actionsDisabled = false;

  export let infoTooltip: string | undefined = undefined;

  export let collapsed = true;
  export let collapsable = false;
</script>

<!--svelte-ignore a11y-click-events-have-key-events -->
<div
  class="section-header"
  on:click={() => (collapsable ? (collapsed = !collapsed) : undefined)}
  class:collapsed
  class:collapsable
>
  <div class="title">
    {#if icon}
      <div data-testid="section-icon" class="icon-wrapper">
        <svelte:component this={icon} style="fill: var(--color-background)" />
      </div>
    {/if}
    <h3>{label}</h3>
    {#if infoTooltip}
      <Tooltip>
        <InfoCircle style="height: 1.5rem; width: 1.5rem;" />
        <svelte:fragment slot="tooltip-content">
          {infoTooltip}
        </svelte:fragment>
      </Tooltip>
    {/if}
    {#if collapsable}
      <button class="expand-button" aria-label="Expand section">
        <ChevronUp style="fill: var(--color-foreground); height: 1.5rem; width: 1.5rem;" />
      </button>
    {/if}
  </div>
  <div class="actions">
    {#each actions as action}
      <Button
        disabled={actionsDisabled}
        variant={action.variant}
        icon={action.icon}
        on:click={action.handler}>{action.label}</Button
      >
    {/each}
  </div>
</div>

<style>
  .section-header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    user-select: none;
  }

  .section-header > * {
    transition: opacity 0.3s;
  }

  .section-header.collapsable {
    cursor: pointer;
  }

  .section-header:not(.expanded) .icon-wrapper,
  .section-header:not(.expanded) h3,
  .section-header:not(.expanded) .actions {
    opacity: 0.9;
  }

  .icon-wrapper {
    background-color: var(--color-foreground);
    height: 2rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 1rem;
    flex-shrink: 0;
  }

  .expand-button {
    background-color: var(--color-foreground-level-2);
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    transition: transform 0.3s, background-color 0.3s;
  }

  .collapsed .expand-button {
    transform: rotate(180deg);
  }

  .expand-button:focus-visible {
    background-color: var(--color-foreground-level-3);
  }

  .expand-button:hover {
    background-color: var(--color-foreground-level-3);
  }

  .actions,
  .title {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .title {
    min-width: 0;
  }

  .title h3 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
