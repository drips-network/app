<script lang="ts">
  import type { getIssues } from '$lib/utils/wave/issues';
  import IssuesListItem from './components/issues-list-item.svelte';

  let {
    issuesWithPagination,
  }: {
    issuesWithPagination: Awaited<ReturnType<typeof getIssues>>;
  } = $props();

  let { data: issues } = issuesWithPagination;
</script>

<div class="wrapper">
  {#each issues as issue (issue.id)}
    <IssuesListItem {issue} />
  {/each}
</div>
