<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Button from '$lib/components/button/button.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import FilterBar from '$lib/components/wave/filter-bar/filter-bar.svelte';
  import PaginatedCardGrid from '$lib/components/wave/paginated-card-grid/paginated-card-grid.svelte';
  import OrgPreviewCard from '$lib/components/wave/org-preview-card/org-preview-card.svelte';
  import type { WaveProgramOrgDto } from '$lib/utils/wave/types/waveProgram';
  import type { Pagination } from '$lib/utils/wave/types/pagination';
  import { getWaveProgramOrgs } from '$lib/utils/wave/wavePrograms.js';
  import type { Snapshot } from '../$types.js';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Orgs from '$lib/components/icons/Orgs.svelte';

  let { data } = $props();
  const { orgs: initialOrgs, waveProgram, search } = $derived(data);

  async function handleSearchChange(value: string | undefined) {
    const currentUrl = new URL(page.url);

    if (value) {
      currentUrl.searchParams.set('search', value);
    } else {
      currentUrl.searchParams.delete('search');
    }

    await goto(currentUrl.toString(), {
      noScroll: true,
      keepFocus: true,
    });
  }

  function getReposFilterString(orgId: string) {
    return btoa(JSON.stringify({ orgId }));
  }

  // svelte-ignore state_referenced_locally
  let items = $state<WaveProgramOrgDto[]>(initialOrgs.data);
  // svelte-ignore state_referenced_locally
  let pagination = $state<Pagination>(initialOrgs.pagination);

  $effect(() => {
    items = initialOrgs.data;
    pagination = initialOrgs.pagination;
  });

  async function fetchMore(nextPage: number) {
    return getWaveProgramOrgs(
      undefined,
      waveProgram.id,
      {
        page: nextPage,
        limit: 20,
      },
      { search },
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
  title="Orgs | {data.waveProgram.name} | Wave"
  description="Explore the organizations approved for the {data.waveProgram.name} Wave Program."
/>

<div class="page">
  <div
    style:view-transition-name="orgs-page-content"
    style:view-transition-class="element-handover"
    style:display="flex"
    style:flex-direction="column"
    style:gap="1.5rem"
  >
    <Breadcrumbs
      crumbs={[
        { label: 'Wave Programs', href: '/wave' },
        { label: data.waveProgram.name, href: `/wave/${data.waveProgram.slug}` },
        { label: 'Orgs', href: '' },
      ]}
    />

    <SectionHeader icon={Orgs} label="Orgs" />

    <FilterBar
      searchPlaceholder="Search orgs..."
      searchValue={search ?? ''}
      onSearchChange={handleSearchChange}
    />
  </div>

  <span class="typo-text intro" style:color="var(--color-foreground-level-5)">
    {#if pagination.total === 0}
      There are no matching orgs approved for the {data.waveProgram.name} Wave yet. Check back later!
    {:else}
      Showing {pagination.total} org{pagination.total === 1 ? '' : 's'} approved for the {data
        .waveProgram.name} Wave Program.
    {/if}
  </span>

  <PaginatedCardGrid {fetchMore} key={(org) => org.id} bind:items bind:pagination>
    {#snippet card(org: WaveProgramOrgDto)}
      <OrgPreviewCard {org}>
        {#snippet actions()}
          <Button
            size="small"
            href={`/wave/${data.waveProgram.slug}/repos?filters=${getReposFilterString(org.id)}`}
          >
            Browse {org.approvedRepoCount} repo{org.approvedRepoCount === 1 ? '' : 's'}
          </Button>
        {/snippet}
      </OrgPreviewCard>
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
