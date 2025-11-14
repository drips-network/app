<script lang="ts">
  import { fade } from 'svelte/transition';

  interface Props {
    metricsMap: Record<string, string>;
    data: Record<string, string>;
  }

  let { metricsMap, data }: Props = $props();
</script>

<div class="grid">
  {#each Object.entries(metricsMap) as [key, label]}
    {@const metricValue = data[key]}
    <div class="metric-value">
      <span class="typo-text">{label}</span>
      <span>
        <span
          class="typo-header-1"
          in:fade={{ duration: 200, delay: 300 }}
          style:height="2rem"
          style:display="block"
          style:position="absolute">{metricValue || 'None'}</span
        >
      </span>
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }

  .metric-value {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    height: 4rem;
  }
</style>
