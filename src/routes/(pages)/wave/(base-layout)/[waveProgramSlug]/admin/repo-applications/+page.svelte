<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { browser } from '$app/environment';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Section from '$lib/components/section/section.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Check from '$lib/components/icons/Check.svelte';
  import Refresh from '$lib/components/icons/Refresh.svelte';
  import { approveWaveProgramRepo, rejectWaveProgramRepo } from '$lib/utils/wave/wavePrograms.js';
  import Cross from '$lib/components/icons/Cross.svelte';

  let { data } = $props();

  let pendingRepoApplications = $derived(data.pendingRepoApplications);
  let isWaveAdmin = $derived(data.isWaveAdmin);

  let processingId = $state<string | null>(null);
  let refreshing = $state(false);

  async function refresh() {
    refreshing = true;
    await invalidate('wave:admin:repo-applications');
    refreshing = false;
  }

  async function approve(waveProgramId: string, orgRepoId: string, applicationId: string) {
    processingId = applicationId;
    try {
      await approveWaveProgramRepo(fetch, waveProgramId, orgRepoId);
      await refresh();
    } finally {
      processingId = null;
    }
  }

  async function reject(waveProgramId: string, orgRepoId: string, applicationId: string) {
    const defaultReason = '';
    const reason = browser
      ? (window.prompt('Rejection reason (optional):', defaultReason) ?? defaultReason)
      : defaultReason;

    processingId = applicationId;
    try {
      await rejectWaveProgramRepo(fetch, waveProgramId, orgRepoId, reason.trim() || undefined);
      await refresh();
    } finally {
      processingId = null;
    }
  }
</script>

<HeadMeta title="Repo applications | Admin | Wave" />

<div class="page">
  <Section
    header={{
      label: 'Repo applications',
      actions: [
        {
          label: 'Refresh',
          icon: Refresh,
          disabled: refreshing || !isWaveAdmin,
          handler: refresh,
        },
      ],
      infoTooltip: 'Review and approve/reject pending repo applications for this Wave program.',
    }}
    skeleton={{
      loaded: true,
      empty: !isWaveAdmin || pendingRepoApplications.pagination.total === 0,
      emptyStateEmoji: !isWaveAdmin ? '🔒' : '🫙',
      emptyStateHeadline: !isWaveAdmin ? 'Not authorized' : 'No pending applications',
      emptyStateText: !isWaveAdmin
        ? 'You are not an admin of this Wave.'
        : 'There are no repos waiting for review in this Wave program.',
    }}
  >
    {#if isWaveAdmin}
      <div class="list">
        {#each pendingRepoApplications.data as application (application.id)}
          <div class="row typo-text">
            <div class="repo">
              <RepoBadge size="small" repo={application.repo} />
              <div class="meta typo-text-small">
                <a
                  class="link"
                  href={application.repo.gitHubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {application.repo.gitHubRepoFullName}
                </a>
                {#if application.appliedAt}
                  <span class="dim"
                    >Applied {application.appliedAt.toLocaleString?.() ??
                      application.appliedAt}</span
                  >
                {/if}
              </div>
            </div>

            <div class="actions">
              <Button
                size="small"
                variant="primary"
                icon={Check}
                loading={processingId === application.id}
                onclick={() =>
                  approve(application.waveProgramId, application.repo.id, application.id)}
                >Approve</Button
              >
              <Button
                size="small"
                variant="destructive-outline"
                icon={Cross}
                loading={processingId === application.id}
                onclick={() =>
                  reject(application.waveProgramId, application.repo.id, application.id)}
                >Reject</Button
              >
            </div>
          </div>
        {/each}
      </div>
    {/if}
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

  .list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .row {
    padding: 1rem;
    border-bottom: 1px solid var(--color-foreground-level-2);
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }

  .row:last-child {
    border-bottom: none;
  }

  .repo {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .meta {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    min-width: 0;
    flex-wrap: wrap;
  }

  .dim {
    color: var(--color-foreground-level-5);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .link {
    color: var(--color-primary);
    text-decoration: none;
  }
</style>
