<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ChevronRight from '$lib/components/icons/ChevronRight.svelte';

  type Status = 'withdrawable' | 'complete' | 'pending';

  let {
    programName,
    waveNumber,
    amount,
    status = 'withdrawable',
    width,
    showAction = true,
  }: {
    programName: string;
    waveNumber: number;
    amount: number;
    status?: Status;
    width?: string;
    showAction?: boolean;
  } = $props();

  const STATUS_LABEL: Record<Status, string> = {
    withdrawable: 'Withdrawable',
    complete: 'Complete',
    pending: 'Pending',
  };

  const STATUS_COLORS: Record<Status, [string, string]> = {
    withdrawable: ['var(--color-positive-level-6)', 'var(--color-positive-level-1)'],
    complete: ['var(--color-positive-level-6)', 'var(--color-positive-level-1)'],
    pending: ['var(--color-caution-level-6)', 'var(--color-caution-level-1)'],
  };

  let [statusColor, statusBg] = $derived(STATUS_COLORS[status]);
</script>

<div class="card" style:width>
  <div class="info">
    <div class="header">
      <span class="program typo-text-bold">{programName} Wave {waveNumber}</span>
      <span
        class="status typo-text-small-bold"
        style:color={statusColor}
        style:background-color={statusBg}
      >
        {STATUS_LABEL[status]}
      </span>
    </div>

    <div class="amount-row">
      <span class="amount tnum">${amount.toLocaleString()}</span>
      <span class="currency typo-text-small">USD</span>
    </div>
  </div>

  {#if showAction}
    <div class="right">
      <Button variant={status === 'withdrawable' ? 'primary' : 'normal'}>
        {status === 'complete' ? 'View receipt' : 'Withdraw'}
      </Button>
      <ChevronRight
        style="width: 1.25rem; height: 1.25rem; fill: var(--color-foreground-level-4);"
      />
    </div>
  {/if}
</div>

<style>
  .card {
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    box-sizing: border-box;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .program {
    white-space: nowrap;
  }

  .status {
    padding: 0.125rem 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
  }

  .amount-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .amount {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1;
  }

  .currency {
    color: var(--color-foreground-level-5);
  }

  .right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .tnum {
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 600px) {
    .card {
      flex-direction: column;
      align-items: stretch;
    }
    .right {
      justify-content: flex-end;
    }
  }
</style>
