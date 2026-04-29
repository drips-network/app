<script lang="ts">
  import type { ComplimentType } from '$lib/utils/wave/types/compliment';
  import type { PointsLedgerEntryDto } from '$lib/utils/wave/types/points';

  let { source }: { source: PointsLedgerEntryDto['source'] } = $props();

  const COMPLIMENT_FRIENDLY_NAMES: Record<ComplimentType, string> = {
    good_communicator: 'Good Communicator',
    fast_and_easy: 'Fast and Easy',
    high_quality_code: 'High Quality Code',
    problem_solver: 'Problem Solver',
  };
</script>

{#if source.type === 'issue'}
  {@const issueInfo = source.data}

  {#if issueInfo}
    <span>Resolved "{issueInfo.title}"</span>
  {:else}
    <span>Resolved a deleted issue</span>
  {/if}
{:else if source.type === 'compliment'}
  {@const complimentInfo = source.data}

  {#if complimentInfo}
    <span>Complimented for "{COMPLIMENT_FRIENDLY_NAMES[complimentInfo.type]}"</span>
  {:else}
    <span>Received a compliment</span>
  {/if}
{:else if source.type === 'adjustment'}
  <span>Manual points adjustment</span>
{/if}
