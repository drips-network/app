<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Ledger from '$lib/components/icons/Ledger.svelte';
  import KeyValuePair from '$lib/components/key-value-pair/key-value-pair.svelte';
  import PulsatingCircle from '$lib/components/pulsating-circle/pulsating-circle.svelte';
  import formatDate from '$lib/utils/format-date';
  import type { WaveCycleDto } from '$lib/utils/wave/types/wave';
  import Card from '../card/card.svelte';

  interface Props {
    cycle: WaveCycleDto;
  }

  let { cycle }: Props = $props();

  let now = new Date();

  let cycleActive = $derived(new Date(cycle.startDate) <= now && now <= new Date(cycle.endDate));
</script>

<Card>
  <div class="cycle-card">
    <div class="cycle-info">
      <div class="cycle-name">
        {#if cycleActive}
          <div class="active-dot">
            <PulsatingCircle />
          </div>
        {/if}
        <h2 class="pixelated">Cycle {cycle.cycleNumber}</h2>
      </div>
      <div class="cycle-dates">
        {formatDate(cycle.startDate, 'standardWithoutYear')} -{' '}
        {formatDate(cycle.endDate, 'standardWithoutYear')}
      </div>
    </div>

    <div class="right">
      <div class="budget">
        <KeyValuePair key="Budget">{cycle.budgetUSD}</KeyValuePair>
      </div>

      <Button variant="primary" icon={Ledger} size="large" href="/wave/{cycle.waveId}/issues">
        Start contributing
      </Button>
    </div>
  </div>
</Card>

<style>
  .cycle-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .cycle-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .cycle-dates {
    color: var(--color-foreground-level-5);
  }

  .right {
    display: flex;
    align-items: center;
    gap: 2rem;
  }
</style>
