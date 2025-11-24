<script lang="ts">
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';

  let {
    issue,
  }: {
    issue: IssueDetailsDto;
  } = $props();
</script>

<div class="issue-list-item">
  <div class="issue-title">{issue.title}</div>
</div>

<style>
</style>
