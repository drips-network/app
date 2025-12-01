<script lang="ts" module>
  export function inferBadges(issue: IssueDetailsDto, showNewApplicationsBadge: boolean) {
    let badges = [];

    if (issue.points) {
      badges.push({
        text: `${issue.points} Points`,
        color: 'var(--color-primary-level-7)',
        backgroundColor: 'var(--color-primary-level-2)',
      });
    }

    if (issue.pendingApplicationsCount && !issue.assignedApplicant && showNewApplicationsBadge) {
      badges.push({
        text: 'New applications',
        color: 'var(--color-caution-level-6)',
        backgroundColor: 'var(--color-caution-level-1)',
        bold: true,
      });
    }

    if (issue.state === 'closed') {
      // Only show closed badge if closed
      badges = [
        {
          text: 'Closed',
          color: 'var(--color-foreground-level-6)',
          backgroundColor: 'var(--color-foreground-level-2)',
        },
      ];
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
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import type { WaveDto } from '$lib/utils/wave/types/wave';
  import WaveBadge from '$lib/components/wave/wave-badge/wave-badge.svelte';

  let {
    issue,
    selectable = false,
    selected = false,
    onselect,
    partOfWave,
    pathPrefix,
    showNewApplicationsBadge = false,
  }: {
    issue: IssueDetailsDto;
    selectable?: boolean;
    selected?: boolean;
    onselect?: (selected: boolean) => void;
    partOfWave?: WaveDto | null;
    pathPrefix: string;
    showNewApplicationsBadge?: boolean;
  } = $props();

  let numberOfLines = determineAmountOfLines(issue);
  let itemHeight = $derived(determineIssuesListItemHeight(issue, showNewApplicationsBadge));

  let active = $derived(page.url.pathname.includes(issue.id));

  let badges = $derived.by(() => inferBadges(issue, showNewApplicationsBadge));
</script>

{#snippet badge(text: string, color: string, backgroundColor: string, bold?: boolean)}
  <span
    class="state-badge typo-text-small{bold ? '-bold' : ''}"
    style:color
    style:background-color={backgroundColor}>{text}</span
  >
{/snippet}

<svelte:element
  this={selectable ? 'div' : 'a'}
  class="issue-list-item"
  href="{pathPrefix}{issue.id}?{page.url.searchParams}"
  style:height={itemHeight + 'px'}
  class:active
>
  {#if selectable}
    <Checkbox
      disabled={issue.state !== 'open'}
      checked={selected}
      onclick={(e) => {
        e.preventDefault();

        onselect?.(!selected);
      }}
    />
  {/if}

  <svelte:element
    this={selectable ? 'a' : 'div'}
    href="/wave/maintainers/issues/{issue.id}?{page.url.searchParams}"
    class="details"
  >
    {#if badges.length > 0}
      <div class="badges">
        {#each badges as { text, color, backgroundColor, bold }}
          {@render badge(text, color, backgroundColor, bold)}
        {/each}
      </div>
    {/if}

    <h3 class="typo-text line-clamp-{numberOfLines}">
      <span class="issue-number-badge">#{issue.gitHubIssueNumber}</span>
      {issue.title}
    </h3>

    <div class="repo-and-wave">
      <RepoBadge size="small" repo={issue.repo} />
      {#if partOfWave}
        <WaveBadge hideName size="small" wave={partOfWave} />
      {/if}
    </div>
  </svelte:element>
</svelte:element>

<style>
  .issue-list-item {
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    display: flex;
    gap: 8px;
    box-sizing: border-box;
    background-color: var(--color-background);
  }

  .issue-list-item .details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
  }

  .repo-and-wave {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
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

  .badges {
    display: flex;
    gap: 0.25rem;
  }
</style>
