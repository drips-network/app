<script lang="ts">
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Section from '$lib/components/section/section.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import WaveBadge from '$lib/components/wave/wave-badge/wave-badge.svelte';
  import type { WaveRepoWithDetailsDto } from '$lib/utils/wave/types/wave';

  let { data } = $props();

  let { waveRepos } = $derived(data);
</script>

{#snippet waveRepo(d: WaveRepoWithDetailsDto)}
  {@const wave = data.waves.data.find((w) => w.id === d.waveId)}
  <div class="repo-application-item typo-text">
    <div class="name-and-wave">
      <RepoBadge size="small" repo={d.repo} /> → {#if wave}
        <WaveBadge {wave} size="small" />
      {/if}
    </div>

    <div class="status typo-text-small">
      {#if d.status === 'pending'}
        <span>Pending review</span>
      {:else if d.status === 'approved'}
        <span class="typo-text-small-bold" style:color="var(--color-positive-level-6)"
          >Approved</span
        >
      {:else if d.status === 'rejected'}
        <span class="typo-text-small-bold" style:color="var(--color-negative-level-6)"
          >Rejected</span
        >
      {/if}
    </div>
  </div>
{/snippet}

<HeadMeta title="Orgs & Repos | Maintainer Dashboard" />

<div class="page">
  <Breadcrumbs crumbs={[{ label: 'Maintainer Dashboard' }, { label: 'Orgs & Repos' }]} />
  <Section
    header={{
      label: 'Repo Applications',
      icon: Ledger,
      actions: [
        {
          label: 'Apply repos to a Wave',
          icon: Plus,
          variant: 'primary',
          disabled: false,
          href: `/wave/maintainer-onboarding/install-app?onCancelGoto=/wave/maintainers/repos`,
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

  .repo-applications-list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .repo-application-item {
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    display: flex;
    justify-content: space-between;
  }

  .repo-application-item:last-child {
    border-bottom: none;
  }

  .repo-application-item .name-and-wave {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
