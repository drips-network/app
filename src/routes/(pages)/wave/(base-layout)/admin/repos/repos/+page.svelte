<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import { page } from '$app/state';
  import Button from '$lib/components/button/button.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import Label from '$lib/components/icons/Label.svelte';
  import Star from '$lib/components/icons/Star.svelte';
  import PaginatedCardGrid from '$lib/components/wave/paginated-card-grid/paginated-card-grid.svelte';
  import RepoPreviewCard from '$lib/components/wave/repo-preview-card/repo-preview-card.svelte';
  import ReposFilterBar from '$lib/components/wave/repos-filter-bar/repos-filter-bar.svelte';
  import modal from '$lib/stores/modal';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { unfeatureWaveProgramRepo, getWaveProgramRepos } from '$lib/utils/wave/wavePrograms';
  import type {
    WaveProgramReposFilters,
    WaveProgramRepoWithDetailsDto,
  } from '$lib/utils/wave/types/waveProgram';
  import type { Pagination } from '$lib/utils/wave/types/pagination';
  import ManageRepoTagsModal from '../components/manage-repo-tags-modal.svelte';
  import FeatureRepoModal from '../components/feature-repo-modal.svelte';

  let { data } = $props();

  let tags = $derived(data.tags);
  let wavePrograms = $derived(data.wavePrograms);
  let canManageTags = $derived(data.canManageTags);
  let canFeatureRepos = $derived(data.canFeatureRepos);

  let waveProgramId = $derived(data.waveProgramId);
  let repos = $derived(data.repos);
  let filters = $derived(data.filters);

  const loadOrgs = () => data.orgsPromise;
  const loadTags = () => Promise.resolve(tags.data);

  let waveProgramOptions = $derived(
    wavePrograms.data.map((wp) => ({
      value: wp.id,
      title: wp.name,
    })),
  );

  // === URL-based navigation ===

  function updateUrl(params: Record<string, string | undefined>) {
    const currentUrl = new URL(page.url);
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === '') {
        currentUrl.searchParams.delete(key);
      } else {
        currentUrl.searchParams.set(key, value);
      }
    }
    return goto(currentUrl.toString(), { noScroll: true, keepFocus: true });
  }

  function handleWaveProgramChange(value: string) {
    const currentUrl = new URL(page.url);
    currentUrl.searchParams.set('waveProgramId', value);
    currentUrl.searchParams.delete('filters');
    goto(currentUrl.toString(), { noScroll: true, keepFocus: true });
  }

  async function handleApplyFilters(newFilters: WaveProgramReposFilters) {
    if (JSON.stringify(newFilters) === JSON.stringify(filters)) return;

    const encodedFilters =
      Object.values(newFilters).filter((v) => !!v).length === 0
        ? ''
        : btoa(JSON.stringify(newFilters));

    await updateUrl({ filters: encodedFilters });
  }

  function getTagFilterHref(tagId: string): string {
    const newFilters = { ...filters, tagId };
    const encoded = btoa(JSON.stringify(newFilters));
    const currentUrl = new URL(page.url);
    currentUrl.searchParams.set('filters', encoded);
    return currentUrl.toString();
  }

  // === PaginatedCardGrid state ===

  // svelte-ignore state_referenced_locally
  let items = $state<WaveProgramRepoWithDetailsDto[]>(repos?.data ?? []);
  // svelte-ignore state_referenced_locally
  let pagination = $state<Pagination>(
    repos?.pagination ?? {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  );

  async function fetchMore(nextPage: number) {
    return getWaveProgramRepos(undefined, waveProgramId!, { page: nextPage, limit: 20 }, filters);
  }

  // === Admin actions ===

  async function reloadPage() {
    await invalidate('wave:admin:repos');
  }

  function openManageTagsModal(repo: WaveProgramRepoWithDetailsDto) {
    modal.show(ManageRepoTagsModal, undefined, {
      repo,
      allTags: tags.data,
      onChanged: reloadPage,
    });
  }

  function openFeatureModal(repo: WaveProgramRepoWithDetailsDto) {
    modal.show(FeatureRepoModal, undefined, {
      repo,
      waveProgramId: waveProgramId!,
      onFeatured: reloadPage,
    });
  }

  async function handleUnfeature(repo: WaveProgramRepoWithDetailsDto) {
    await doWithConfirmationModal(
      `Remove featured status from ${repo.repo.gitHubRepoFullName}?`,
      () =>
        doWithErrorModal(async () => {
          await unfeatureWaveProgramRepo(fetch, waveProgramId!, repo.repo.id);
          await reloadPage();
        }),
    );
  }
</script>

<div class="repos-page">
  <div class="header-row">
    <h3 class="typo-header-4">Repos</h3>
    <Dropdown
      value={waveProgramId ?? undefined}
      options={waveProgramOptions}
      onchange={handleWaveProgramChange}
    />
  </div>

  {#if waveProgramId && repos}
    <div class="filter-section">
      {#key filters}
        <ReposFilterBar {filters} onFiltersChange={handleApplyFilters} {loadOrgs} {loadTags} />
      {/key}
    </div>

    <span class="typo-text intro" style:color="var(--color-foreground-level-5)">
      {#if pagination.total === 0}
        No matching repos found.
      {:else}
        Showing {pagination.total} matching repo{pagination.total === 1 ? '' : 's'}.
      {/if}
    </span>

    <PaginatedCardGrid
      initialData={repos}
      {fetchMore}
      key={(item) => item.repo.id}
      bind:items
      bind:pagination
    >
      {#snippet card(repoWithDetails: WaveProgramRepoWithDetailsDto)}
        <RepoPreviewCard {repoWithDetails} tagHref={getTagFilterHref}>
          {#snippet actions()}
            <div class="admin-actions">
              {#if canManageTags}
                <Button
                  size="small"
                  icon={Label}
                  onclick={() => openManageTagsModal(repoWithDetails)}>Tags</Button
                >
              {/if}

              {#if canFeatureRepos}
                {#if repoWithDetails.pointsMultiplier && repoWithDetails.pointsMultiplier > 1}
                  <Button
                    size="small"
                    variant="destructive-outline"
                    icon={Star}
                    onclick={() => handleUnfeature(repoWithDetails)}>Unfeature</Button
                  >
                {:else}
                  <Button
                    size="small"
                    variant="primary"
                    icon={Star}
                    onclick={() => openFeatureModal(repoWithDetails)}>Feature</Button
                  >
                {/if}
              {/if}
            </div>
          {/snippet}
        </RepoPreviewCard>
      {/snippet}
    </PaginatedCardGrid>
  {:else}
    <p class="typo-text dim">No Wave Programs available.</p>
  {/if}
</div>

<style>
  .repos-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .filter-section {
    position: relative;
    z-index: 1;
  }

  .intro {
    max-width: 36rem;
  }

  .admin-actions {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
    font-size: 0.75rem;
    scale: 0.9;
    transform-origin: left center;
  }

  .dim {
    color: var(--color-foreground-level-5);
  }
</style>
