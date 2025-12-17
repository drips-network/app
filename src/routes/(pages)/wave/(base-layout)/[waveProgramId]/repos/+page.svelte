<script lang="ts">
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import Trophy from '$lib/components/icons/Trophy.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';

  let { data } = $props();
  const { repos } = $derived(data);
</script>

<div class="page">
  <Breadcrumbs
    crumbs={[
      { label: 'Wave Programs', href: '/wave' },
      { label: data.waveProgram.name, href: `/wave/${data.waveProgram.id}` },
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

  <span class="typo-text intro" style:color="var(--color-foreground-level-5)"
    >Showing {repos.pagination.total} repos that are approved for the {data.waveProgram.name} Wave.
  </span>

  <div class="repo-list">
    {#each repos.data as { repo } (repo.id)}
      <a
        class="repo-entry"
        href="https://github.com/{repo.gitHubRepoFullName}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <RepoBadge {repo} />
      </a>
    {/each}
  </div>
</div>

<style>
  .page {
    display: flex;
    max-width: 48rem;
    margin: 0 auto;
    width: 100%;
    flex-direction: column;
    gap: 1.5rem;
  }

  .intro {
    max-width: 36rem;
  }

  .repo-list {
    display: flex;
    flex-direction: column;
  }

  .repo-entry {
    display: flex;
    padding: 0.5rem 0.75rem;
    border-left: 1px solid var(--color-foreground-level-3);
    border-right: 1px solid var(--color-foreground-level-3);
    border-bottom: 1px solid var(--color-foreground-level-3);
    text-decoration: none;
    color: inherit;
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }

  .repo-entry:first-child {
    border-top: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 0 0;
  }

  .repo-entry:hover,
  .repo-entry:focus-visible {
    background-color: var(--color-foreground-level-1);
  }

  .repo-entry:last-child {
    border-bottom: 1px solid var(--color-foreground-level-3);
    border-radius: 0 0 1rem 1rem;
  }
</style>
