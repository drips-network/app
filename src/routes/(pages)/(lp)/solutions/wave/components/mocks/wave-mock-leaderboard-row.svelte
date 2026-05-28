<script lang="ts">
  import WaveMockUserBadge from './wave-mock-user-badge.svelte';

  let {
    rank,
    user,
    points,
    share,
    payout,
    highlighted = false,
  }: {
    rank: number;
    user: { name: string; avatarUrl?: string };
    points: number;
    share: string;
    payout?: string;
    highlighted?: boolean;
  } = $props();
</script>

<div class="row" class:highlighted>
  <span class="rank typo-text-small-bold">#{rank}</span>
  <div class="user">
    <WaveMockUserBadge name={user.name} avatarUrl={user.avatarUrl} size={28} />
  </div>
  <div class="points">
    <span class="typo-text-bold tnum">{points.toLocaleString()}</span>
    <span class="typo-text-small label">pts</span>
  </div>
  <div class="share typo-text-small">{share}</div>
  {#if payout}
    <div class="payout typo-text-bold tnum">{payout}</div>
  {/if}
</div>

<style>
  .row {
    display: grid;
    grid-template-columns: 2rem 1fr auto auto auto;
    align-items: center;
    gap: 1rem;
    padding: 0.625rem 1rem;
    background-color: var(--color-background);
    border-bottom: 1px solid var(--color-foreground-level-2);
  }

  .row.highlighted {
    background-color: var(--color-primary-level-1);
  }

  .rank {
    color: var(--color-foreground-level-6);
  }

  .points {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }

  .points .label {
    color: var(--color-foreground-level-5);
  }

  .share {
    color: var(--color-foreground-level-6);
    min-width: 3rem;
    text-align: right;
  }

  .payout {
    color: var(--color-positive-level-6);
    min-width: 4.5rem;
    text-align: right;
  }

  @media (max-width: 600px) {
    .row {
      grid-template-columns: 2rem 1fr auto auto;
      gap: 0.5rem;
    }
    .share {
      display: none;
    }
  }

  .tnum {
    font-variant-numeric: tabular-nums;
  }
</style>
