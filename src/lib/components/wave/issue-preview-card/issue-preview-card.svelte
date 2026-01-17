<script lang="ts">
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import Card from '../card/card.svelte';

  let { issue }: { issue: IssueDetailsDto } = $props();

  let issueUrl = $derived(`${issue.repo.gitHubRepoUrl}/issues/${issue.gitHubIssueNumber}`);

  let badges = $derived.by(() => {
    const result = [];

    if (issue.state === 'closed') {
      result.push({
        text: 'Closed',
        color: 'var(--color-foreground-level-6)',
        backgroundColor: 'var(--color-foreground-level-2)',
      });
    }

    if (issue.points) {
      result.push({
        text: `${issue.points} Points`,
        color: 'var(--color-primary-level-7)',
        backgroundColor: 'var(--color-primary-level-2)',
      });
    }

    return result;
  });
</script>

{#snippet badge(text: string, color: string, backgroundColor: string)}
  <span class="state-badge typo-text-small" style:color style:background-color={backgroundColor}
    >{text}</span
  >
{/snippet}

<Card>
  <a href={issueUrl} target="_blank" rel="noopener noreferrer" class="issue-preview-card">
    {#if badges.length > 0}
      <div class="badges">
        {#each badges as { text, color, backgroundColor } (text)}
          {@render badge(text, color, backgroundColor)}
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
