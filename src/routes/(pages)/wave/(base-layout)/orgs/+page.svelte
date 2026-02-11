<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Button from '$lib/components/button/button.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import FilterBar from '$lib/components/wave/filter-bar/filter-bar.svelte';
  import PaginatedCardGrid from '$lib/components/wave/paginated-card-grid/paginated-card-grid.svelte';
  import type { PublicOrgDto } from '$lib/utils/wave/types/org';
  import type { Pagination } from '$lib/utils/wave/types/pagination';
  import { getPublicOrgs } from '$lib/utils/wave/orgs.js';
  import type { Snapshot } from './$types.js';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
  import Link from '$lib/components/icons/Link.svelte';
  import Orgs from '$lib/components/icons/Orgs.svelte';

  let { data } = $props();
  const { orgs: initialOrgs, search } = $derived(data);

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

  // svelte-ignore state_referenced_locally
  let items = $state<PublicOrgDto[]>(initialOrgs.data);
  // svelte-ignore state_referenced_locally
  let pagination = $state<Pagination>(initialOrgs.pagination);

  async function fetchMore(nextPage: number) {
    return getPublicOrgs(
      undefined,
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

<HeadMeta title="Explore orgs | Wave" description="Explore all organizations on Drips Wave." />

<div class="page">
  <div
    style:view-transition-name="orgs-page-content"
    style:view-transition-class="element-handover"
    style:display="flex"
    style:flex-direction="column"
    style:gap="1.5rem"
  >
    <Breadcrumbs crumbs={[{ label: 'Explore Orgs', href: '' }]} />

    <SectionHeader icon={Orgs} label="Orgs" />

    <FilterBar
      searchPlaceholder="Search orgs..."
      searchValue={search ?? ''}
      onSearchChange={handleSearchChange}
    />
  </div>

  <span class="typo-text intro" style:color="var(--color-foreground-level-5)">
    {#if pagination.total === 0}
      There are no matching orgs on Drips Wave.
    {:else}
      Showing {pagination.total} org{pagination.total === 1 ? '' : 's'} with at least one repo approved
      for a Wave Program.
    {/if}
  </span>

  <PaginatedCardGrid initialData={initialOrgs} {fetchMore} bind:items bind:pagination>
    {#snippet card(org: PublicOrgDto)}
      <Card>
        <div class="org-item">
          <a class="org-header" href="/wave/orgs/{org.id}">
            <UserAvatar size={24} src={org.gitHubOrgAvatarUrl ?? undefined} />
            <span class="org-name typo-text">{org.gitHubOrgLogin}</span>
            <ChevronRight style="margin-left: auto;" />
          </a>

          <span class="description typo-text-small line-clamp-2">
            {#if org.contactInfo?.description}
              {org.contactInfo.description}
            {:else}
              <span style:color="var(--color-foreground-level-4)">No description</span>
            {/if}
          </span>

          <div class="spacer"></div>

          {#if org.contactInfo?.url}
            <a
              class="website typo-text-small"
              href={org.contactInfo.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link style="width: 16px; height: 16px;" />
              {new URL(org.contactInfo.url).hostname}
            </a>
          {/if}

          <div>
            <Button size="small" href={`/wave/orgs/${org.id}`}>View org</Button>
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

  .org-item {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 100%;
  }

  .spacer {
    flex: 1;
  }

  .org-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: inherit;
    text-decoration: none;
  }

  .org-name {
    overflow-wrap: anywhere;
  }

  .description {
    color: var(--color-foreground-level-6);
    min-height: 2lh;
  }

  .website {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-foreground-level-5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
