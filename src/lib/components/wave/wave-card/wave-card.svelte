<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import KeyValuePair from '$lib/components/key-value-pair/key-value-pair.svelte';
  import PulsatingCircle from '$lib/components/pulsating-circle/pulsating-circle.svelte';
  import formatDate from '$lib/utils/format-date';
  import type { WaveDto } from '$lib/utils/wave/types/waveProgram';
  import Card from '../card/card.svelte';

  interface Props {
    wave: WaveDto;
    waveProgram: {
      slug: string;
    };
  }

  let { wave, waveProgram }: Props = $props();
  const { status } = $derived(wave);

  function getCountdownText(target: Date): string | null {
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());

    const diffTime = targetStart.getTime() - todayStart.getTime();

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return null;
    } else if (diffDays === 0) {
      return 'later today';
    } else if (diffDays === 1) {
      return 'in 1 day';
    } else {
      return `in ${diffDays} days`;
    }
  }
</script>

<Card
  style="background-color: {status === 'active' || status === 'upcoming'
    ? 'var(--color-primary-level-1)'
    : 'var(--color-background)'}"
>
  <div class="wave-card">
    <div class="wave-info">
      {#if status === 'active' || status === 'upcoming'}
        <div class="status-badge typo-text">
          <div class="active-dot">
            <PulsatingCircle />
          </div>

          {#if status === 'active'}
            <div class="status-text">Active until {formatDate(wave.endDate, 'onlyDay')}</div>
          {:else if status === 'upcoming'}
            <div class="status-text">Starts {getCountdownText(wave.startDate)}</div>
          {/if}
        </div>
      {/if}
      <div class="wave-name">
        <h2 class="pixelated">Wave {wave.waveNumber}</h2>
      </div>
      <div class="wave-dates">
        {formatDate(wave.startDate, 'standardWithoutYear')} - {formatDate(
          wave.endDate,
          'standardWithoutYear',
        )}
      </div>
    </div>

    <div class="right">
      <div class="budget">
        <KeyValuePair key="Budget">${wave.budgetUSD}</KeyValuePair>
      </div>

      {#if status === 'active' || status === 'upcoming'}
        <div class="action">
          <Button
            variant={status === 'active' ? 'primary' : 'normal'}
            icon={Ledger}
            size="large"
            href="/wave/{waveProgram.slug}/issues"
          >
            {status === 'active' ? 'Start contributing' : 'Preview issues'}
          </Button>
        </div>
      {/if}
    </div>
  </div>
</Card>

<style>
  .wave-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .wave-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    background-color: var(--color-background);
    color: var(--color-primary-level-9);
    padding: 0.25rem 0.75rem;
    border-radius: 2rem 0 2rem 2rem;
    width: fit-content;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .wave-dates {
    color: var(--color-foreground-level-5);
  }

  .right {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  @media (max-width: 600px) {
    .wave-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .right {
      flex-direction: column;
      gap: 1rem;
      width: 100%;
    }

    .budget {
      width: 100%;
    }

    .action {
      display: flex;
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
