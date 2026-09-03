<script lang="ts">
  import ArrowUp from '$lib/components/icons/ArrowUp.svelte';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';

  let {
    pctChange,
    previousWaveNumber,
  }: {
    pctChange: number | null;
    previousWaveNumber: number | null;
  } = $props();

  let direction = $derived(
    pctChange === null ? null : pctChange > 0 ? 'up' : pctChange < 0 ? 'down' : 'flat',
  );
</script>

{#if pctChange !== null && previousWaveNumber !== null && direction}
  <Tooltip text="Compared to your activity in Wave {previousWaveNumber}">
    <span
      class="delta-badge typo-text-small tnum"
      class:up={direction === 'up'}
      class:down={direction === 'down'}
    >
      {#if direction === 'up'}
        <ArrowUp style="height: 0.875rem; width: 0.875rem; fill: currentColor" />
      {:else if direction === 'down'}
        <ArrowDown style="height: 0.875rem; width: 0.875rem; fill: currentColor" />
      {/if}
      {direction === 'flat' ? '±' : ''}{Math.abs(pctChange)}%
    </span>
  </Tooltip>
{/if}

<style>
  .delta-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    padding: 0 0.375rem;
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    background-color: var(--color-foreground-level-2);
    color: var(--color-foreground-level-6);
    white-space: nowrap;
  }

  .delta-badge.up {
    background-color: var(--color-positive-level-1);
    color: var(--color-positive-level-6);
  }

  .delta-badge.down {
    background-color: var(--color-negative-level-1);
    color: var(--color-negative-level-6);
  }
</style>
