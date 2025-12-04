<script lang="ts">
  import SingleIssuePage from '$lib/components/wave/issues-page/single-issue-page.svelte';

  let { data } = $props();
</script>

<SingleIssuePage {...data} />
