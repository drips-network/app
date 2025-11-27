<script lang="ts" module>
  export function inferBadges(issue: IssueDetailsDto) {
    const badges = [];

    if (issue.state === 'closed') {
      badges.push({
        text: 'Closed',
        color: 'var(--color-foreground-level-6)',
        backgroundColor: 'var(--color-foreground-level-2)',
      });
    }

    return badges;
  }
</script>

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

  let badges = $derived.by(() => inferBadges(issue));
</script>

{#snippet badge(text: string, color: string, backgroundColor: string)}
  <span class="state-badge typo-text-small" style:color style:background-color={backgroundColor}
    >{text}</span
  >
{/snippet}

<a
  class="issue-list-item"
  href="/wave/maintainers/issues/{issue.id}?{page.url.searchParams}"
  style:height={itemHeight + 'px'}
  class:active
>
  {#if badges.length > 0}
    <div class="badges">
      {#each badges as { text, color, backgroundColor }}
        {@render badge(text, color, backgroundColor)}
      {/each}
    </div>
  {/if}

  <h3 class="typo-text line-clamp-{numberOfLines}">
    <span class="issue-number-badge">#{issue.gitHubIssueNumber}</span>
    {issue.title}
  </h3>

  <div class="details">
    <RepoBadge size="small" repo={issue.repo} />
  </div>
</a>

<style>
  .issue-list-item {
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-sizing: border-box;
    background-color: var(--color-background);
  }

  .state-badge {
    border-radius: 1rem 0 1rem 1rem;
    width: fit-content;
    padding: 0.25rem 0.5rem;
    height: 24px;
    display: inline-block;
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
