<script lang="ts">
  import convertGhLanguageListToLanguageProfile from '$lib/components/programming-language-breakdown/convert-gh-language-list-to-language-profile';
  import ProgrammingLanguageBreakdown from '$lib/components/programming-language-breakdown/programming-language-breakdown.svelte';
  import Fork from '$lib/components/icons/Fork.svelte';
  import Star from '$lib/components/icons/Star.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import type { WaveProgramRepoWithDetailsDto } from '$lib/utils/wave/types/waveProgram';
  import type { Snippet } from 'svelte';

  interface Props {
    repoWithDetails: WaveProgramRepoWithDetailsDto;
    actions?: Snippet;
  }

  let { repoWithDetails, actions }: Props = $props();

  const { repo, org, pointsMultiplier } = $derived(repoWithDetails);
  const isFeatured = $derived(pointsMultiplier && pointsMultiplier > 1);
</script>

<Card
  style={isFeatured
    ? 'background: linear-gradient(135deg, var(--color-caution-level-1) 0%, transparent 50%);'
    : undefined}
>
  <div class="repo-item">
    <div class="top">
      <div class="owner-and-repo">
        <UserAvatar size={24} src={org.gitHubOrgAvatarUrl ?? undefined} />

        <a
          class="repo-name typo-text line-clamp-2"
          href="https://github.com/{repo.gitHubRepoFullName}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span style:color="var(--color-foreground-level-5)">
            {repo.gitHubRepoFullName.split('/')[0]} /
          </span>
          {repo.gitHubRepoFullName.split('/')[1]}
        </a>

        {#if isFeatured}
          <span class="featured-badge">{pointsMultiplier}x Points</span>
        {/if}
      </div>

      <span class="description typo-text-small line-clamp-2">
        {#if repo.description}
          {repo.description}
        {:else}
          <span style:color="var(--color-foreground-level-4)">No description</span>
        {/if}
      </span>

      <div class="languages">
        <ProgrammingLanguageBreakdown
          size="compact"
          languageProfile={convertGhLanguageListToLanguageProfile(repo.languages)}
        />
      </div>
    </div>

    <div class="bottom-row">
      {#if actions}
        {@render actions()}
      {/if}

      <div class="repo-stats">
        <span class="stat">
          <Star style="width: 1rem; height: 1rem;" />
          {repo.stargazersCount?.toString() ?? '0'}
        </span>
        <span class="stat">
          <Fork style="width: 1rem; height: 1rem;" />
          {repo.forksCount?.toString() ?? '0'}
        </span>
      </div>
    </div>
  </div>
</Card>

<style>
  .repo-item {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .top {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .repo-name {
    overflow-wrap: anywhere;
  }

  .owner-and-repo {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .description {
    min-height: 2lh;
    color: var(--color-foreground-level-6);
  }

  .languages {
    margin-top: 0.25rem;
  }

  .bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .repo-stats {
    display: flex;
    gap: 0.75rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-foreground-level-5);
    font-size: 0.875rem;
  }

  .featured-badge {
    background-color: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
    padding: 0.125rem 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    margin-left: auto;
    flex-shrink: 0;
  }
</style>
