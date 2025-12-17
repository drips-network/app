<script lang="ts">
  import type { Component } from 'svelte';
  import Button from '../button/button.svelte';
  import Tooltip from '../tooltip/tooltip.svelte';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import ChevronUp from '$lib/components/icons/ChevronUp.svelte';

  interface Props {
    icon?: Component | undefined;
    label: string;
    count?: number;
    actions?: {
      handler?: (event: MouseEvent) => void;
      href?: string;
      target?: string;
      label?: string;
      icon?: Component;
      variant?: 'primary';
      disabled?: boolean;
      loading?: boolean;
    }[];
    actionsDisabled?: boolean;
    anchorTarget?: string | undefined;
    infoTooltip?: string | undefined;
    collapsed?: boolean;
    collapsable?: boolean;
  }

  let {
    icon = undefined,
    label,
    count = undefined,
    actions = [],
    actionsDisabled = false,
    anchorTarget = undefined,
    infoTooltip = undefined,
    collapsed = $bindable(true),
    collapsable = $bindable(false),
  }: Props = $props();
</script>

<!--svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="section-header"
  class:has-actions={actions.length > 0}
  onclick={() => (collapsable ? (collapsed = !collapsed) : undefined)}
  class:collapsed
  class:collapsable
>
  {#if anchorTarget}
    <div class="anchor-target" id={anchorTarget}></div>
  {/if}

  <div class="title">
    {#if icon}
      {@const SvelteComponent = icon}
      <div data-testid="section-icon" class="icon-wrapper icon-primary">
        <SvelteComponent style="fill: var(--color-primary-level-6)" />
      </div>
    {/if}
    <h3>{label}</h3>

    {#if count !== undefined}
      <div class="count typo-text-bold">
        {count}
      </div>
    {/if}

    {#if infoTooltip}
      <Tooltip>
        <InfoCircle style="height: 1.5rem; width: 1.5rem;" />
        {#snippet tooltip_content()}
          {infoTooltip}
        {/snippet}
      </Tooltip>
    {/if}
    {#if collapsable}
      <button class="expand-button" aria-label="Expand section">
        <ChevronUp style="fill: var(--color-foreground); height: 1.5rem; width: 1.5rem;" />
      </button>
    {/if}
  </div>
  <div class="actions">
    {#each actions as action (action.label)}
      <Button
        disabled={action.disabled || actionsDisabled}
        loading={action.loading}
        variant={action.variant}
        icon={action.icon}
        href={action.href}
        target={action.target}
        onclick={action.handler}>{action.label}</Button
      >
    {/each}
  </div>
</div>

<style>
  .section-header {
    position: relative;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    user-select: none;
  }

  .anchor-target {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
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

  .icon-wrapper.icon-primary {
    background-color: var(--color-primary-level-1);
  }

  .expand-button {
    background-color: var(--color-foreground-level-2);
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    transition:
      transform 0.3s,
      background-color 0.3s;
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

  .count {
    background-color: var(--color-foreground-level-2);
    padding: 0rem 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    font-size: 0.875rem;
    color: var(--color-foreground);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .section-header {
      flex-direction: column;
      align-items: stretch;
      gap: 0;
    }

    .section-header.has-actions {
      gap: 1rem;
    }

    .title h3 {
      overflow: visible;
      text-overflow: unset;
      white-space: normal;
    }

    .actions {
      justify-content: flex-start;
    }
  }
</style>
