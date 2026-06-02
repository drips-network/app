<script lang="ts">
  import { invalidate } from '$app/navigation';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Refresh from '$lib/components/icons/Refresh.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import modal from '$lib/stores/modal';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { deleteWave } from '$lib/utils/wave/wavePrograms';
  import type { WaveDto } from '$lib/utils/wave/types/waveProgram';
  import CreateWaveModal from './components/create-wave-modal.svelte';
  import EditWaveModal from './components/edit-wave-modal.svelte';

  let { data } = $props();

  let waveProgram = $derived(data.waveProgram);
  let waves = $derived(data.waves);
  let refreshing = $state(false);

  async function refresh() {
    refreshing = true;
    await invalidate('wave:admin:waves:program');
    refreshing = false;
  }

  function openCreateModal() {
    modal.show(CreateWaveModal, undefined, {
      waveProgramId: waveProgram.id,
      presetBudgetUSD: waveProgram.presetBudgetUSD,
      onCreated: refresh,
    });
  }

  function openEditModal(wave: WaveDto) {
    modal.show(EditWaveModal, undefined, {
      waveProgramId: waveProgram.id,
      wave,
      onUpdated: refresh,
    });
  }

  async function confirmDelete(wave: WaveDto) {
    const message = `Delete Wave #${wave.waveNumber}? This cannot be undone. Only upcoming waves can be deleted.`;
    await doWithConfirmationModal(message, async () => {
      await doWithErrorModal(() => deleteWave(fetch, waveProgram.id, wave.id), undefined, {
        message: `Wave #${wave.waveNumber} deleted.`,
        confetti: false,
      });
      await refresh();
    });
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatBudget(usd: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(usd);
  }
</script>

<HeadMeta title="{waveProgram.name} | Waves | Admin | Wave" />

<div class="page">
  <Breadcrumbs
    crumbs={[
      { label: 'Admin', href: '/wave/admin' },
      { label: 'Waves', href: '/wave/admin/waves' },
      { label: waveProgram.name },
    ]}
  />
  <Section
    header={{
      label: `Waves for ${waveProgram.name}`,
      actions: [
        {
          label: 'Refresh',
          icon: Refresh,
          disabled: refreshing,
          handler: refresh,
        },
        {
          label: 'Schedule wave',
          icon: Plus,
          variant: 'primary',
          handler: openCreateModal,
        },
      ],
    }}
    skeleton={{
      loaded: true,
      empty: waves.length === 0,
      emptyStateEmoji: '🌊',
      emptyStateHeadline: 'No waves yet',
      emptyStateText: 'Schedule the first wave for this program.',
    }}
  >
    <div class="list">
      {#each waves as wave (wave.id)}
        <div class="row">
          <div class="left">
            <span class="typo-text-bold">Wave #{wave.waveNumber}</span>
            <div class="meta typo-text-small">
              <span
                class="badge"
                class:upcoming={wave.status === 'upcoming'}
                class:active={wave.status === 'active'}
                class:ended={wave.status === 'ended'}
              >
                {wave.status}
              </span>
              <span class="dim">·</span>
              <span class="dim">{formatDate(wave.startDate)} – {formatDate(wave.endDate)}</span>
              <span class="dim">·</span>
              <span class="dim">{formatBudget(wave.budgetUSD)} budget</span>
            </div>
          </div>
          <div class="actions">
            {#if wave.status !== 'ended'}
              <Button size="small" variant="ghost" onclick={() => openEditModal(wave)}>
                {wave.status === 'active' ? 'Extend' : 'Edit'}
              </Button>
            {/if}
            {#if wave.status === 'upcoming'}
              <Button
                size="small"
                variant="destructive"
                icon={Trash}
                onclick={() => confirmDelete(wave)}>Delete</Button
              >
            {/if}
          </div>
        </div>
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

  .left {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
  }

  .meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .dim {
    color: var(--color-foreground-level-5);
  }

  .badge {
    text-transform: uppercase;
    font-size: 0.625rem;
    letter-spacing: 0.05em;
    padding: 0.125rem 0.5rem;
    border-radius: 0.5rem;
    font-family: var(--typeface-mono);
  }

  .badge.upcoming {
    background: var(--color-primary-level-1);
    color: var(--color-primary-level-6);
  }

  .badge.active {
    background: var(--color-positive-level-1);
    color: var(--color-positive-level-6);
  }

  .badge.ended {
    background: var(--color-foreground-level-2);
    color: var(--color-foreground-level-6);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
</style>
