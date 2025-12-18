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
</script>

<Card>
  <div class="wave-card">
    <div class="wave-info">
      <div class="wave-name">
        {#if status === 'active'}
          <div class="active-dot">
            <PulsatingCircle />
          </div>
        {/if}
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
            variant="primary"
            icon={Ledger}
            size="large"
            href="/wave/{waveProgram.slug}/issues"
          >
            {status === 'active' ? 'Start contributing' : 'View issues'}
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

  .wave-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
