<script lang="ts">
  import type { PointsLedgerEntryDto } from '$lib/utils/wave/types/points';

  interface Props {
    ledgerEntry: PointsLedgerEntryDto;
  }

  let { ledgerEntry }: Props = $props();
</script>

<div class="ledger-entry">
  <p class="points tnum typo-text">
    {ledgerEntry.points}
  </p>
</div>

<style>
  .ledger-entry {
    display: flex;
  }

  p.points {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    font-size: 1.5rem;
    line-height: 2rem;
  }
</style>
