<script lang="ts">
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import type { IssueFilters } from '$lib/utils/wave/types/issue';

  let { data } = $props();
  const { repos } = $derived(data);

  function getFilterString(repoId: string) {
    const filters: IssueFilters = {
      repoId,
      state: 'open',
    };

    return btoa(JSON.stringify(filters));
  }
</script>

<div class="page">
  <Breadcrumbs
    crumbs={[
      { label: 'Wave Programs', href: '/wave' },
      { label: data.waveProgram.name, href: `/wave/${data.waveProgram.slug}` },
      { label: 'Repos', href: '' },
    ]}
  />

  <SectionHeader
    icon={Trophy}
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

  <span class="typo-text intro" style:color="var(--color-foreground-level-5)">
    {#if repos.pagination.total === 0}
      There are no repos approved for the {data.waveProgram.name} Wave yet. Check back later!
    {:else}
      Showing {repos.pagination.total} repos that are approved for the {data.waveProgram.name} Wave.
    {/if}
  </span>

  <div class="repo-grid">
    {#each repos.data as { repo, org } (repo.id)}
      <Card>
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
            </div>

            <span class="description typo-text-small line-clamp-2">
              {repo.description}
            </span>
          </div>

          <div>
            <Button
              size="small"
              href={`/wave/${data.waveProgram.slug}/issues?filters=${getFilterString(repo.id)}`}
            >
              Browse issues
            </Button>
          </div>
        </div>
      </Card>
    {/each}
  </div>
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

  .repo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1rem;
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
    color: var(--color-foreground-level-6);
  }
</style>
