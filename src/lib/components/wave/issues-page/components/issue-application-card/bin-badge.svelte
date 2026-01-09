<script lang="ts">
  import type { UserCodeMetricsDto } from '$lib/utils/wave/types/user';
  import { fade } from 'svelte/transition';

  interface Props {
    codeMetricsPromise: Promise<UserCodeMetricsDto | null>;
    key: string;
    showUnknown?: boolean;
  }

  let { codeMetricsPromise, key, showUnknown = false }: Props = $props();

  const BIN_COLOR_MAP = {
    good: ['var(--color-positive-level-6)', 'var(--color-positive-level-1)'],
    mid: ['var(--color-foreground-level-6)', 'var(--color-foreground-level-2)'],
    bad: ['var(--color-caution-level-6)', 'var(--color-caution-level-1)'],
  } as const;

  // reserveMetric means that lower is better (e.g. merge latency)
  const GOOD_BINS = (reverseMetric: boolean) =>
    reverseMetric ? ['Low', 'Very Low'] : ['Exceptional', 'Very High', 'High'];
  const MID_BINS = ['Medium'];
  const BAD_BINS = (reverseMetric: boolean) =>
    reverseMetric ? ['Exceptional', 'Very High', 'High'] : ['Low', 'Very Low'];

  const reverseMetricKeys = new Set<string>(['avg_merge_latency_hours', 'pr_drop_rate']);

  function getBinColors(bin: string | undefined, key: string): readonly [string, string] {
    const reverse = reverseMetricKeys.has(key);

    if (bin && GOOD_BINS(reverse).includes(bin)) {
      return BIN_COLOR_MAP['good'];
    } else if (bin && MID_BINS.includes(bin)) {
      return BIN_COLOR_MAP['mid'];
    } else if (bin && BAD_BINS(reverse).includes(bin)) {
      return BIN_COLOR_MAP['bad'];
    } else {
      return ['', ''];
    }
  }
</script>

{#await codeMetricsPromise}
  <div class="typo-text-small bin-badge">Loading...</div>
{:then metrics}
  {#if !metrics && showUnknown}
    <div
      in:fade={{ duration: 200 }}
      class="typo-text-small bin-badge"
      style="color: var(--color-foreground-level-6); background-color: var(--color-foreground-level-2);"
    >
      Unknown
    </div>
  {:else if metrics}
    {@const bin = metrics?.metrics[key]?.bin}
    {#if bin}
      {@const [textColor, bgColor] = getBinColors(bin, key)}
      <div
        in:fade={{ duration: 200 }}
        class="typo-text-small bin-badge"
        style="color: {textColor}; background-color: {bgColor};"
      >
        {bin}
      </div>
    {:else if bin === null && showUnknown}
      <div
        in:fade={{ duration: 200 }}
        class="typo-text-small bin-badge"
        style="color: var(--color-foreground-level-6); background-color: var(--color-foreground-level-2);"
      >
        Not enough data
      </div>
    {:else if showUnknown}
      <div
        in:fade={{ duration: 200 }}
        class="typo-text-small bin-badge"
        style="color: var(--color-foreground-level-6); background-color: var(--color-foreground-level-2);"
      >
        Unknown
      </div>
    {/if}
  {/if}
{:catch}
  {#if showUnknown}
    <div
      in:fade={{ duration: 200 }}
      class="typo-text-small bin-badge"
      style="color: var(--color-foreground-level-6); background-color: var(--color-foreground-level-2);"
    >
      Unknown
    </div>
  {/if}
{/await}

<style>
  .bin-badge {
    padding: 0.125rem 0.5rem;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
  }
</style>
