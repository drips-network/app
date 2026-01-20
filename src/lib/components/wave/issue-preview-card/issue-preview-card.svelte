<script lang="ts">
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import Card from '../card/card.svelte';
  import Multiplier from '$lib/components/icons/Multiplier.svelte';

  type Badge = {
    text: string;
    color: string;
    backgroundColor: string;
    showMultiplierIcon?: boolean;
  };

  let { issue }: { issue: IssueDetailsDto } = $props();

  let issueUrl = $derived(`${issue.repo.gitHubRepoUrl}/issues/${issue.gitHubIssueNumber}`);

  let badges = $derived.by(() => {
    const result: Badge[] = [];

    if (issue.state === 'closed') {
      result.push({
        text: 'Closed',
        color: 'var(--color-foreground-level-6)',
        backgroundColor: 'var(--color-foreground-level-2)',
      });
    }

    if (issue.points) {
      const multiplier = issue.pointsMultiplier ?? 1;
      const hasMultiplier = multiplier > 1;
      const displayPoints = hasMultiplier ? issue.points * multiplier : issue.points;

      result.push({
        text: `${displayPoints} Points`,
        color: hasMultiplier ? 'var(--color-positive-level-6)' : 'var(--color-primary-level-7)',
        backgroundColor: hasMultiplier
          ? 'var(--color-positive-level-1)'
          : 'var(--color-primary-level-2)',
        showMultiplierIcon: hasMultiplier,
      });
    }

    return result;
  });
</script>

{#snippet badge(text: string, color: string, backgroundColor: string, showMultiplierIcon?: boolean)}
  <span
    class="state-badge typo-text-small"
    class:has-icon={showMultiplierIcon}
    style:color
    style:background-color={backgroundColor}
  >
    {#if showMultiplierIcon}
      <Multiplier style="width: 0.875rem; height: 0.875rem; fill: currentColor;" />
    {/if}
    {text}
  </span>
{/snippet}

<Card>
  <a href={issueUrl} target="_blank" rel="noopener noreferrer" class="issue-preview-card">
    {#if badges.length > 0}
      <div class="badges">
        {#each badges as { text, color, backgroundColor, showMultiplierIcon } (text)}
          {@render badge(text, color, backgroundColor, showMultiplierIcon)}
        {/each}
      </div>
    {/if}

    <h3 class="typo-text-bold title line-clamp-2">
      <span class="issue-number-badge">#{issue.gitHubIssueNumber}</span>
      {issue.title}
    </h3>

    <div class="bottom-row">
      <RepoBadge
        size="small"
        repo={issue.repo}
        avatarUrl={issue.repo.org.gitHubOrgAvatarUrl ?? undefined}
      />
    </div>
  </a>
</Card>

<style>
  .issue-preview-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background-color: var(--color-background);
    text-align: left;
    height: 100%;
  }

  .bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: auto;
  }

  .badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .state-badge {
    border-radius: 1rem 0 1rem 1rem;
    width: fit-content;
    padding: 0.25rem 0.5rem;
    height: 24px;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .state-badge.has-icon {
    font-weight: 600;
  }

  .title {
    margin: 0;
    word-break: break-word;
    font-size: 1.125rem;
  }

  .issue-number-badge {
    color: var(--color-foreground-level-5);
  }
</style>
