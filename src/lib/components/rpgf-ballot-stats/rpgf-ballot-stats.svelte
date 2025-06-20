<script lang="ts">
  import MetricsGrid from '../metrics-grid/metrics-grid.svelte';

  export let ballotStats: {
    numberOfVoters: number;
    numberOfBallots: number;
  };
</script>

<MetricsGrid
  metricsMap={{
    numberOfVoters: 'Voters',
    numberOfBallots: 'Submitted Ballots',
  }}
  data={{
    numberOfVoters: ballotStats.numberOfVoters.toString(),
    numberOfBallots: ballotStats.numberOfBallots.toString(),
  }}
/>
