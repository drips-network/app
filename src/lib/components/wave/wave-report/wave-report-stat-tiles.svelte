<script lang="ts">
  import DeltaBadge from './delta-badge.svelte';

  export interface StatTile {
    key: string;
    value: number;
    pctChange: number | null;
  }

  let {
    tiles,
    previousWaveNumber,
  }: {
    tiles: StatTile[];
    previousWaveNumber: number | null;
  } = $props();
</script>

<div class="stat-tiles">
  {#each tiles as tile (tile.key)}
    <div class="stat-tile">
      <h5>{tile.key}</h5>
      <div class="value-row">
        <span class="value tnum">{tile.value}</span>
        <DeltaBadge pctChange={tile.pctChange} {previousWaveNumber} />
      </div>
    </div>
  {/each}
</div>

<style>
  .stat-tiles {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  }

  .stat-tile {
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    box-shadow: var(--elevation-low);
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-tile h5 {
    color: var(--color-foreground-level-6);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .value-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .value {
    font-size: 2rem;
    line-height: 2.5rem;
  }
</style>
