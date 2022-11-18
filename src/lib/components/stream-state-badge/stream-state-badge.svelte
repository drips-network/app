<script context="module" lang="ts">
  export type StreamState = 'scheduled' | 'paused' | 'active' | 'ended' | 'out-of-funds';
</script>

<script lang="ts">
  export let state: StreamState;

  const colorMap = {
    paused: 'color-caution',
    active: 'color-positive',
    ended: 'color-foreground',
    scheduled: 'color-caution',
    'out-of-funds': 'color-caution',
  } as const;
  $: stateColor = colorMap[state];

  const stateLabels = {
    paused: 'Paused',
    active: 'Active',
    ended: 'Ended',
    scheduled: 'Scheduled',
    'out-of-funds': 'Out of funds',
  } as const;
  $: stateLabel = stateLabels[state];
</script>

<div class="stream-state-badge" style:background-color={`var(--${stateColor}-level-1`}>
  <div class="dot" style:background-color={`var(--${stateColor}-level-6`} />
  <span class="typo-text-bold" style:color={`var(--${stateColor}-level-6`}>{stateLabel}</span>
</div>

<style>
  .stream-state-badge {
    height: 2rem;
    border-radius: 1rem;
    display: flex;
    gap: 0.5rem;
    padding: 0 0.75rem;
    align-items: center;
    user-select: none;
  }

  .dot {
    height: 0.5rem;
    width: 0.5rem;
    border-radius: 0.25rem;
  }
</style>
