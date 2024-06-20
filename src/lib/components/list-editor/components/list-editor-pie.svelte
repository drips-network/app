<script lang="ts">
  import Check from '$lib/components/icons/Check.svelte';
  import Exclamation from '$lib/components/icons/Exclamation.svelte';
  import { fade, scale } from 'svelte/transition';

  const MAX_WEIGHT = 1000000;

  export let hasEmptyInputs: boolean;
  export let totalWeight: number;

  $: valid = totalWeight === MAX_WEIGHT && !hasEmptyInputs;
  $: error = hasEmptyInputs || totalWeight > MAX_WEIGHT;

  function formatWeight(weight: number) {
    const percentage = weight / 10000;
    return percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(4);
  }
</script>

<div class="remaining-percentage-indicator typo-text-small-bold" class:error class:valid>
  {#if hasEmptyInputs}
    Empty inputs
  {:else}
    {formatWeight(totalWeight)}% split
  {/if}
  <div class="pie">
    <svg height="32" width="32" viewBox="0 0 32 32">
      {#if !error && !valid}
        <circle
          transition:fade={{ duration: 200 }}
          r="12"
          cx="16"
          cy="16"
          fill="var(--color-primary-level-1"
        />
      {/if}
      <circle
        class="pie-piece"
        r="6"
        cx="16"
        cy="16"
        fill="transparent"
        stroke-width="12"
        stroke-dasharray="calc({hasEmptyInputs
          ? 100
          : totalWeight / 10000} * 37.6991118431 / 100) 37.6991118431"
        transform="rotate(-90) translate(-32)"
      /></svg
    >
    {#if error}
      <div
        class="icon"
        in:scale={{ duration: 300, start: 1.5 }}
        out:scale={{ duration: 300, start: 0.8 }}
      >
        <Exclamation style="fill: var(--color-background);" />
      </div>
    {:else if valid}
      <div
        class="icon"
        in:scale={{ duration: 300, start: 1.5 }}
        out:scale={{ duration: 300, start: 0.8 }}
      >
        <Check style="fill: var(--color-background);" />
      </div>
    {/if}
  </div>
</div>

<style>
  .remaining-percentage-indicator {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
  }

  .remaining-percentage-indicator.error {
    color: var(--color-negative);
  }

  .remaining-percentage-indicator.valid {
    color: var(--color-positive);
  }

  .remaining-percentage-indicator .pie {
    overflow: visible;
    position: relative;
  }

  .remaining-percentage-indicator .pie .icon {
    position: absolute;
    top: 4px;
    left: 4px;
  }

  .remaining-percentage-indicator .pie .pie-piece {
    transition: all 0.2s;
  }

  .remaining-percentage-indicator .pie .pie-piece {
    stroke: var(--color-primary);
  }

  .remaining-percentage-indicator.error .pie .pie-piece {
    stroke: var(--color-negative);
  }

  .remaining-percentage-indicator.valid .pie .pie-piece {
    stroke: var(--color-positive);
  }
</style>
