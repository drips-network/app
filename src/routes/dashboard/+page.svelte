<script lang="ts">
  import Balances from './sections/balances.section.svelte';
  import Streams from './sections/streams.section.svelte';
</script>

<svelte:head>
  <title>Drips — Dashboard</title>
  <meta name="description" value="Radicle Drips Dashboard" />
</svelte:head>

<div class="dashboard">
  <h1>Dashboard</h1>
  <Balances />
  <Streams />
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
</style>
