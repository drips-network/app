<script lang="ts">
  import { page } from '$app/state';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import {
    determineAmountOfLines,
    determineIssuesListItemHeight,
  } from './determine-issues-list-item-height';

  let {
    issue,
  }: {
    issue: IssueDetailsDto;
  } = $props();

  let numberOfLines = determineAmountOfLines(issue);
  let itemHeight = determineIssuesListItemHeight(issue);

  let active = $derived(page.url.pathname === `/wave/maintainers/issues/${issue.id}`);
</script>

<a
  class="issue-list-item"
  href="/wave/maintainers/issues/{issue.id}?{page.url.searchParams}"
  style:height={itemHeight + 'px'}
  class:active
>
  <h3 class="typo-text line-clamp-{numberOfLines}">
    <span class="issue-number-badge">#{issue.gitHubIssueNumber}</span>
    {issue.title}
  </h3>

  <div class="details">
    <RepoBadge repo={issue.repo} />
  </div>
</a>

<style>
  .issue-list-item {
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    box-sizing: border-box;
    background-color: var(--color-background);
  }

  .issue-number-badge {
    color: var(--color-foreground-level-5);
  }

  .issue-list-item.active {
    background-color: var(--color-primary-level-1);
  }

  .issue-list-item:not(.active):hover {
    background-color: var(--color-foreground-level-1);
  }
</style>
