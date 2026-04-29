<script lang="ts">
  import convertGhLanguageListToLanguageProfile from '$lib/components/programming-language-breakdown/convert-gh-language-list-to-language-profile';
  import ProgrammingLanguageBreakdown from '$lib/components/programming-language-breakdown/programming-language-breakdown.svelte';
  import Fork from '$lib/components/icons/Fork.svelte';
  import Star from '$lib/components/icons/Star.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import Flag from '$lib/components/icons/Flag.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import reportFlow from '$lib/flows/wave/report/report-flow';
  import type { WaveProgramRepoWithDetailsDto } from '$lib/utils/wave/types/waveProgram';
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';

  interface Props {
    repoWithDetails: WaveProgramRepoWithDetailsDto;
    actions?: Snippet;
    tagHref?: (tagId: string) => string;
  }

  let { repoWithDetails, actions, tagHref }: Props = $props();

  const { repo, org, pointsMultiplier } = $derived(repoWithDetails);
  const isFeatured = $derived(pointsMultiplier && pointsMultiplier > 1);
  const tagWithImage = $derived(repo.tags?.find((t) => t.imageUrl));
  const tagImageUrl = $derived(tagWithImage?.imageUrl);
  const tagColor = $derived(tagWithImage?.color);

  const cardStyle = $derived.by(() => {
    if (tagColor)
      return `position: relative; background: linear-gradient(135deg, ${tagColor}15 0%, transparent 60%); border-color: ${tagColor}30;`;
    if (isFeatured)
      return 'background: linear-gradient(135deg, var(--color-caution-level-1) 0%, transparent 50%);';
    return undefined;
  });
</script>

<Card style={cardStyle}>
  {#if tagImageUrl}
    <img src={tagImageUrl} alt="" class="card-bg-image" />
  {/if}
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

      {#if repo.tags && repo.tags.length > 0}
        <div class="tags">
          {#each repo.tags as tag (tag.id)}
            {#if tagHref}
              <a
                class="tag-badge clickable"
                style:background-color="{tag.color}20"
                style:color={tag.color}
                style:border-color="{tag.color}40"
                href={tagHref(tag.id)}
              >
                {tag.name}
              </a>
            {:else}
              <span
                class="tag-badge"
                style:background-color="{tag.color}20"
                style:color={tag.color}
                style:border-color="{tag.color}40"
              >
                {tag.name}
              </span>
            {/if}
          {/each}
        </div>
      {/if}

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

      <div class="right-side">
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
        {#if page.data.user}
          <Tooltip>
            <button
              class="report-button"
              onclick={() => modal.show(Stepper, undefined, reportFlow('repo', repo.id))}
            >
              <Flag style="width: 1rem; height: 1rem;" />
            </button>
            {#snippet tooltip_content()}
              <span class="typo-text-small">Report repo</span>
            {/snippet}
          </Tooltip>
        {/if}
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
    position: relative;
    z-index: 1;
  }

  .card-bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: right;
    opacity: 0.15;
    filter: blur(2px);
    scale: 1.05;
    pointer-events: none;
    mask-image: linear-gradient(to right, transparent 20%, black);
    -webkit-mask-image: linear-gradient(to right, transparent 20%, black);
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

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .tag-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.0625rem 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    border: 1px solid;
    background: none;
  }

  .tag-badge.clickable {
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .tag-badge.clickable:hover {
    opacity: 0.7;
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

  .right-side {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-left: auto;
  }

  .repo-stats {
    display: flex;
    gap: 0.75rem;
  }

  .report-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-foreground-level-1);
    border: none;
    border-radius: 50%;
    padding: 0.375rem;
    cursor: pointer;
    color: var(--color-foreground-level-4);
    transition:
      color 0.15s ease,
      background 0.15s ease;
  }

  .report-button:hover {
    color: var(--color-foreground-level-5);
    background: var(--color-foreground-level-2);
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
