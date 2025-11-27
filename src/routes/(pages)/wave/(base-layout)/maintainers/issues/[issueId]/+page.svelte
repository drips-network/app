<script lang="ts">
  import SingleIssuePage from '$lib/components/wave/issues-page/single-issue-page.svelte';

  let { data } = $props();
  let issue = $derived(data.issue);

  let partOfWave = $derived(data.waves.data.find((wave) => wave.id === issue.waveId) ?? null);
</script>

<SingleIssuePage
  waves={data.waves.data}
  issue={data.issue}
  waveRepos={data.waveRepos.data}
  allowAddingOrRemovingWave
  {partOfWave}
/>
