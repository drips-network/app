<script lang="ts">
  import { invalidate } from '$app/navigation';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Refresh from '$lib/components/icons/Refresh.svelte';

  let { data } = $props();

  let wavePrograms = $derived(data.wavePrograms);
  let refreshing = $state(false);

  async function refresh() {
    refreshing = true;
    await invalidate('wave:admin:waves');
    refreshing = false;
  }
</script>

<HeadMeta title="Waves | Admin | Wave" />

<div class="page">
  <Breadcrumbs crumbs={[{ label: 'Admin', href: '/wave/admin' }, { label: 'Waves' }]} />
  <Section
    header={{
      label: 'Wave Programs',
      actions: [
        {
          label: 'Refresh',
          icon: Refresh,
          disabled: refreshing,
          handler: refresh,
        },
      ],
    }}
    skeleton={{
      loaded: true,
      empty: wavePrograms.length === 0,
      emptyStateEmoji: '🌊',
      emptyStateHeadline: 'No wave programs',
      emptyStateText: 'There are no wave programs to manage.',
    }}
  >
    <div class="list">
      {#each wavePrograms as program (program.id)}
        <div class="row">
          <div class="left">
            {#if program.avatarUrl}
              <img class="avatar" src={program.avatarUrl} alt="" />
            {:else}
              <div class="avatar avatar-fallback">{program.name.slice(0, 1).toUpperCase()}</div>
            {/if}
            <div class="info">
              <span class="typo-text-bold">{program.name}</span>
              <div class="meta typo-text-small">
                <span class="dim"
                  >{program.waveCount} {program.waveCount === 1 ? 'wave' : 'waves'}</span
                >
                <span class="dim">·</span>
                <span class="dim"
                  >every {program.waveDurationDays}d on day {program.waveDayOfMonth}</span
                >
                {#if program.paused}
                  <span class="dim">·</span>
                  <span class="badge paused">paused</span>
                {/if}
              </div>
            </div>
          </div>
          <div class="actions">
            <Button size="small" href={`/wave/admin/waves/${program.id}`}>Manage Waves</Button>
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
    gap: 0.75rem;
    align-items: center;
    min-width: 0;
    flex: 1;
  }

  .avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    object-fit: cover;
    flex-shrink: 0;
  }

  .avatar-fallback {
    background: var(--color-foreground-level-2);
    color: var(--color-foreground-level-6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
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

  .badge.paused {
    background: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
</style>
