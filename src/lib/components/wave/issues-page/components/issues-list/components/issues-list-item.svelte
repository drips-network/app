<script lang="ts" module>
  type Badge = {
    text: string;
    color: string;
    backgroundColor: string;
    bold?: boolean;
    showMultiplierIcon?: boolean;
  };

  export function inferBadges(
    issue: IssueDetailsDto,
    showNewApplicationsBadge: boolean,
    ownUserId: string | null,
  ) {
    let badges: Badge[] = [];

    if (issue.points) {
      const multiplier = issue.pointsMultiplier ?? 1;
      const hasMultiplier = multiplier > 1;
      const displayPoints = hasMultiplier ? issue.points * multiplier : issue.points;

      badges.push({
        text: hasMultiplier ? `${displayPoints} Points` : `${issue.points} Points`,
        color: hasMultiplier ? 'var(--color-positive-level-6)' : 'var(--color-primary-level-7)',
        backgroundColor: hasMultiplier
          ? 'var(--color-positive-level-1)'
          : 'var(--color-primary-level-2)',
        bold: hasMultiplier ? true : undefined,
        showMultiplierIcon: hasMultiplier ? true : undefined,
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

    if (ownUserId && issue.assignedApplicant?.id === ownUserId) {
      badges.push({
        text: 'Assigned to you',
        color: 'var(--color-positive-level-6)',
        backgroundColor: 'var(--color-positive-level-1)',
        bold: true,
      });
    } else if (issue.assignedApplicant) {
      badges.push({
        text: 'Assigned',
        color: 'var(--color-caution-level-6)',
        backgroundColor: 'var(--color-caution-level-1)',
        bold: true,
      });
    }

    if (issue.assignedApplicant && !issue.hasPr) {
      const isOverdue = issue.assignedApplicant.dueDate < new Date();

      badges.push(
        isOverdue
          ? {
              text: 'Overdue',
              color: 'var(--color-negative-level-6)',
              backgroundColor: 'var(--color-negative-level-1)',
              bold: true,
            }
          : {
              text: `Due ${formatDate(issue.assignedApplicant.dueDate, 'short')}`,
              color: 'var(--color-caution-level-6)',
              backgroundColor: 'var(--color-caution-level-1)',
              bold: true,
            },
      );
    }

    if (issue.hasPr) {
      badges.push({
        text: 'PR submitted',
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
  import type { WaveProgramDto } from '$lib/utils/wave/types/waveProgram';
  import WaveBadge from '$lib/components/wave/wave-program-badge/wave-program-badge.svelte';
  import { renderIssueTitle } from '$lib/utils/wave/issues';
  import formatDate from '$lib/utils/format-date';
  import Multiplier from '$lib/components/icons/Multiplier.svelte';

  let {
    issue,
    selectable = false,
    selected = false,
    onselect,
    partOfWaveProgram,
    pathPrefix,
    ownUserId,
    showNewApplicationsBadge = false,
  }: {
    issue: IssueDetailsDto;
    selectable?: boolean;
    selected?: boolean;
    onselect?: (selected: boolean) => void;
    partOfWaveProgram?: WaveProgramDto | null;
    pathPrefix: string;
    ownUserId: string | null;
    showNewApplicationsBadge?: boolean;
  } = $props();

  let numberOfLines = determineAmountOfLines(issue);
  let itemHeight = $derived(
    determineIssuesListItemHeight(issue, showNewApplicationsBadge, ownUserId),
  );

  let active = $derived(page.url.pathname.includes(issue.id));

  let badges = $derived.by(() => inferBadges(issue, showNewApplicationsBadge, ownUserId));
</script>

{#snippet badge(
  text: string,
  color: string,
  backgroundColor: string,
  bold?: boolean,
  showMultiplierIcon?: boolean,
)}
  <span class="state-badge" class:bold style:color style:background-color={backgroundColor}>
    {#if showMultiplierIcon}
      <Multiplier style="width: 0.875rem; height: 0.875rem; fill: currentColor;" />
    {/if}
    {text}
  </span>
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
        {#each badges as { text, color, backgroundColor, bold, showMultiplierIcon } (text)}
          {@render badge(text, color, backgroundColor, bold, showMultiplierIcon)}
        {/each}
      </div>
    {/if}

    <h3 class="typo-text line-clamp-{numberOfLines}">
      <span class="issue-number-badge">#{issue.gitHubIssueNumber}</span>
      {@html renderIssueTitle(issue.title)}
    </h3>

    <div class="repo-and-wave">
      <RepoBadge
        size="small"
        repo={issue.repo}
        avatarUrl={issue.repo.org.gitHubOrgAvatarUrl ?? undefined}
      />
      {#if partOfWaveProgram}
        <WaveBadge hideName size="small" waveProgram={partOfWaveProgram} />
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
    transition: background-color 0.2s;
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
    padding: 0 0.5rem;
    height: 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
  }

  .state-badge.bold {
    font-weight: 600;
  }

  .issue-number-badge {
    color: var(--color-foreground-level-5);
  }

  .issue-list-item.active {
    background-color: var(--color-primary-level-1);
  }

  .issue-list-item:not(.active):hover,
  .issue-list-item:not(.active):focus-visible {
    background-color: var(--color-foreground-level-1);
  }

  .badges {
    display: flex;
    gap: 0.25rem;
  }
</style>
