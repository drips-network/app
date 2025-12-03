<script lang="ts">
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import type { WaveDto } from '$lib/utils/wave/types/wave';

  let {
    wave,
  }: {
    wave: WaveDto;
  } = $props();

  let stats = $derived([
    {
      key: 'Issues',
      value: wave.issueCount,
      tooltip: 'Count of issues added to the Wave by maintainers.',
    },
    {
      key: 'Repos',
      value: wave.approvedRepoCount,
      tooltip: 'Count of repositories approved for the Wave.',
    },
    {
      key: 'Maintainers',
      value: wave.approvedOrgCount,
      tooltip: 'Count of orgs and users approved to add their issues into the Wave.',
    },
    {
      key: 'Funds rewarded',
      value: '', // TODO(wave)
      tooltip: 'Total funds rewarded to contributors in the Wave.',
    },
    {
      key: 'Leaderboard',
      value: '', // TODO(wave)
      tooltip: 'Current leaderboard standings of points earned for the Wave.',
    },
    {
      key: 'Cycles',
      value: wave.cycleCount,
      tooltip: 'Count of current and past cycles in the Wave.',
    },
  ]);
</script>

{#snippet stat(key: string, value: number | string, tooltip: string)}
  <div class="wave-stat">
    <div class="header">
      <h5>{key}</h5>
      <Tooltip>
        <InfoCircle style="width: 16px; height: 16px;" />

        {#snippet tooltip_content()}
          <p class="typo-text">{tooltip}</p>
        {/snippet}
      </Tooltip>
    </div>
    <p class="value typo-text">{value}</p>
  </div>
{/snippet}

<div class="wave-stats">
  {#each stats as { key, value, tooltip }}
    {@render stat(key, value, tooltip)}
  {/each}
</div>

<style>
  .header {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .header h5 {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--color-foreground-level-6);
  }

  .value {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .wave-stats {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  }

  .wave-stat {
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    border: 1px solid var(--color-foreground-level-3);
    padding: 0.25rem 0.5rem;
  }
</style>
