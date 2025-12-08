<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Section from '$lib/components/section/section.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import type { WaveRepoWithDetailsDto } from '$lib/utils/wave/types/wave';

  let { data } = $props();

  let { waveRepos } = $derived(data);
</script>

{#snippet waveRepo(d: WaveRepoWithDetailsDto)}
  <div class="repo-application-item">
    <RepoBadge repo={d.repo} />
  </div>
{/snippet}

<HeadMeta title="Orgs & Repos | Maintainer Dashboard" />

<!-- TODO(wave): Show all repos with wave applications & their statuses -->
<Section
  header={{
    label: 'Wave Repo Applications',
    icon: Ledger,
    actions: [
      {
        label: 'Apply repos to a Wave',
        icon: Plus,
        variant: 'primary',
        disabled: false,
        href: `/wave/maintainer-onboarding/apply-to-wave`,
      },
    ],
    infoTooltip:
      "Before you can add issues to a Wave, the source repo must be accepted by the Wave's organizers. This list shows the status of your repo applications.",
  }}
  skeleton={{
    loaded: true,
    empty: waveRepos.pagination.total === 0,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No repo applications yet',
    emptyStateText: 'Apply your repos to a Wave to get started.',
  }}
>
  <div class="repo-applications-list">
    {#each waveRepos.data as repoApplication (repoApplication.id)}
      {@render waveRepo(repoApplication)}
    {/each}
  </div>
</Section>

<style>
  .repo-applications-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .repo-application-item {
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
  }

  .repo-application-item:last-child {
    border-bottom: none;
  }
</style>
