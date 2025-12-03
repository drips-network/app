<script lang="ts">
  let { data } = $props();
</script>

<h1>Waves</h1>
{#each data.waves.data as wave}
  <a href="/wave/{wave.id}" class="wave-item">
    {wave.name}
  </a>
{/each}
