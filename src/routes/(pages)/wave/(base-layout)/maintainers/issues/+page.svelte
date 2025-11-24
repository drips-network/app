<script lang="ts">
  import IssuesList from '$lib/components/wave/issues-list/issues-list.svelte';

  let { data } = $props();
</script>

<IssuesList issuesWithPagination={data.issues} />
