<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import PaginatedCardGrid from '$lib/components/wave/paginated-card-grid/paginated-card-grid.svelte';
  import RepoPreviewCard from '$lib/components/wave/repo-preview-card/repo-preview-card.svelte';
  import ReposFilterBar from '$lib/components/wave/repos-filter-bar/repos-filter-bar.svelte';
  import type { IssueFilters } from '$lib/utils/wave/types/issue';
  import type {
    WaveProgramReposFilters,
    WaveProgramRepoWithDetailsDto,
  } from '$lib/utils/wave/types/waveProgram';
  import type { Pagination } from '$lib/utils/wave/types/pagination';
  import { getWaveProgramRepos } from '$lib/utils/wave/wavePrograms.js';
  import type { Snapshot } from './$types.js';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Folder from '$lib/components/icons/Folder.svelte';

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

  $effect(() => {
    items = initialRepos.data;
    pagination = initialRepos.pagination;
  });

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

  <PaginatedCardGrid {fetchMore} key={(item) => item.repo.id} bind:items bind:pagination>
    {#snippet card(repoWithDetails: WaveProgramRepoWithDetailsDto)}
      <RepoPreviewCard {repoWithDetails}>
        {#snippet actions()}
          <Button
            size="small"
            disabled={repoWithDetails.issueCount === 0}
            href={`/wave/${data.waveProgram.slug}/issues?filters=${getIssueFilterString(repoWithDetails.repo.id)}`}
          >
            {#if repoWithDetails.issueCount === 0}
              No open issues
            {:else}
              Browse {repoWithDetails.issueCount} issues
            {/if}
          </Button>
        {/snippet}
      </RepoPreviewCard>
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
</style>
