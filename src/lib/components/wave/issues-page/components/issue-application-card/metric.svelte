<script lang="ts">
  import type { UserCodeMetricsDto } from '$lib/utils/wave/types/user';

  interface Props {
    codeMetricsPromise: Promise<UserCodeMetricsDto | null>;
    key: string;
    fmt: 'number' | 'percentage';
  }

  let { codeMetricsPromise, key, fmt }: Props = $props();
</script>

<span class="typo-text-mono">
  {#await codeMetricsPromise then metrics}
    {#if metrics}
      {@const value = metrics.metrics[key]?.value}
      {#if value}
        {#if fmt === 'number'}
          {Math.round(value)}
        {:else if fmt === 'percentage'}
          {(value * 100).toFixed(2)}%
        {/if}
      {:else if value === null}
        <span class="no-data">Not enough data</span>
      {:else}
        <span class="no-data">Unknown</span>
      {/if}
    {:else}
      <span class="no-data">Unknown</span>
    {/if}
  {:catch}
    <span class="no-data">Unknown</span>
  {/await}
</span>

<style>
  .no-data {
    color: var(--color-foreground-level-5);
  }
</style>
