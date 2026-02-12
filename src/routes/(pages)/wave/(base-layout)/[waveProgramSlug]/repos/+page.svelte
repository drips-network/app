<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import convertGhLanguageListToLanguageProfile from '$lib/components/programming-language-breakdown/convert-gh-language-list-to-language-profile';
  import ProgrammingLanguageBreakdown from '$lib/components/programming-language-breakdown/programming-language-breakdown.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import PaginatedCardGrid from '$lib/components/wave/paginated-card-grid/paginated-card-grid.svelte';
  import ReposFilterBar from '$lib/components/wave/repos-filter-bar/repos-filter-bar.svelte';
  import type { IssueFilters } from '$lib/utils/wave/types/issue';
  import type {
    WaveProgramReposFilters,
    WaveProgramRepoWithDetailsDto,
  } from '$lib/utils/wave/types/waveProgram';
  import type { Pagination } from '$lib/utils/wave/types/pagination';
  import { getWaveProgramRepos } from '$lib/utils/wave/wavePrograms.js';
  import type { Snapshot } from '../$types.js';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Folder from '$lib/components/icons/Folder.svelte';
  import Star from '$lib/components/icons/Star.svelte';
  import Fork from '$lib/components/icons/Fork.svelte';

  let { data } = $props();
  const { repos: initialRepos, waveProgram, filters, orgsPromise } = $derived(data);

  function getIssueFilterString(repoId: string) {
    const filters: IssueFilters = {
      repoId,
      state: 'open',
    };

    return btoa(JSON.stringify(filters));
  }

  async function handleApplyFilters(newFilters: WaveProgramReposFilters) {
    if (JSON.stringify(newFilters) === JSON.stringify(filters)) {
      return;
    }

    const encodedFilters =
      Object.values(newFilters).filter((v) => !!v).length === 0
        ? ''
        : btoa(JSON.stringify(newFilters));

    const currentUrl = new URL(page.url);
    currentUrl.searchParams.set('filters', encodedFilters);

    await goto(currentUrl.toString(), {
      noScroll: true,
      keepFocus: true,
    });
  }

  // svelte-ignore state_referenced_locally
  let items = $state<WaveProgramRepoWithDetailsDto[]>(initialRepos.data);
  // svelte-ignore state_referenced_locally
  let pagination = $state<Pagination>(initialRepos.pagination);

  async function fetchMore(nextPage: number) {
    return getWaveProgramRepos(
      undefined,
      waveProgram.id,
      {
        page: nextPage,
        limit: 20,
      },
      filters,
    );
  }

  // restore data on navigation back
  export const snapshot: Snapshot<{
    items: typeof items;
    pagination: typeof pagination;
    scrollPos: number;
  }> = {
    capture: () => {
      return {
        items,
        pagination,
        scrollPos: window.scrollY,
      };
    },
    restore: (data) => {
      items = data.items;
      pagination = data.pagination;

      setTimeout(() => {
        window.scrollTo({
          top: data.scrollPos,
          behavior: 'instant',
        });
      }, 0);
    },
  };
</script>

<HeadMeta
  title="Repos | {data.waveProgram.name} | Wave"
  description="Explore the repositories approved for the {data.waveProgram.name} Wave Program."
/>

<div class="page">
  <div
    style:view-transition-name="repos-page-content"
    style:view-transition-class="element-handover"
    style:display="flex"
    style:flex-direction="column"
    style:gap="1.5rem"
  >
    <Breadcrumbs
      crumbs={[
        { label: 'Wave Programs', href: '/wave' },
        { label: data.waveProgram.name, href: `/wave/${data.waveProgram.slug}` },
        { label: 'Repos', href: '' },
      ]}
    />

    <SectionHeader
      icon={Folder}
      label="Repos"
      actions={[
        {
          label: 'Apply your repo',
          icon: ArrowRight,
          href:
            '/wave/maintainer-onboarding/install-app?onCancelGoto=/wave/' +
            data.waveProgram.id +
            '/repos',
        },
      ]}
    />

    <ReposFilterBar {filters} onFiltersChange={handleApplyFilters} {orgsPromise} />
  </div>

  <span class="typo-text intro" style:color="var(--color-foreground-level-5)">
    {#if pagination.total === 0}
      There are no matching repos approved for the {data.waveProgram.name} Wave yet. Check back later!
    {:else}
      Showing {pagination.total} matching repo{pagination.total === 1 ? '' : 's'} that {pagination.total ===
      1
        ? 'is'
        : 'are'} approved for the {data.waveProgram.name} Wave Program.
    {/if}
  </span>

  <PaginatedCardGrid initialData={initialRepos} {fetchMore} bind:items bind:pagination>
    {#snippet card({ repo, org, issueCount, pointsMultiplier }: WaveProgramRepoWithDetailsDto)}
      {@const isFeatured = pointsMultiplier && pointsMultiplier > 1}
      <Card
        style={isFeatured
          ? 'background: linear-gradient(135deg, var(--color-caution-level-1) 0%, transparent 50%);'
          : undefined}
      >
        <div class="repo-item">
          <div class="top" style:display="flex" style:flex-direction="column" style:gap="0.5rem">
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
            <Button
              size="small"
              disabled={issueCount === 0}
              href={`/wave/${data.waveProgram.slug}/issues?filters=${getIssueFilterString(repo.id)}`}
            >
              {#if issueCount === 0}
                No open issues
              {:else}
                Browse {issueCount} issues
              {/if}
            </Button>

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
    {/snippet}
  </PaginatedCardGrid>
</div>

<style>
  .page {
    display: flex;
    max-width: 90rem;
    margin: 0 auto;
    width: 100%;
    flex-direction: column;
    gap: 1.5rem;
  }

  .intro {
    max-width: 36rem;
  }

  .repo-item {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.5rem;
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
