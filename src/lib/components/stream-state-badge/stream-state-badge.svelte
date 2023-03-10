<script context="module" lang="ts">
  export type StreamState = 'scheduled' | 'paused' | 'active' | 'ended' | 'out-of-funds';
</script>

<script lang="ts">
  import balances from '$lib/stores/balances/balances.store';
  import streams from '$lib/stores/streams';
  import type { StreamId } from '$lib/stores/streams/types';
  import getStreamHistory from '$lib/utils/stream-history';
  import unreachable from '$lib/utils/unreachable';

  export let streamId: StreamId;
  export let paused: boolean;
  export let durationSeconds: number | undefined = undefined;
  export let startDate: Date | undefined = undefined;
  export let senderId: string;
  export let tokenAddress: string;

  export let hideActive = false;
  export let size: 'small' | 'normal' = 'normal';

  $: assetConfig = $streams && streams.getAssetConfig(senderId, tokenAddress);
  $: streamHistory = assetConfig ? getStreamHistory(assetConfig, streamId) : undefined;

  $: estimate = $balances && balances.getEstimateByStreamId(streamId);
  $: streamScheduledStart = startDate;
  $: streamCreated = streamHistory?.[0].timestamp;
  $: streamStartDate = new Date(streamScheduledStart ?? streamCreated ?? unreachable());
  $: streamEndDate = durationSeconds
    ? new Date(streamStartDate.getTime() + durationSeconds * 1000)
    : undefined;

  let state: StreamState | undefined;
  $: {
    if (estimate) {
      if (paused) {
        state = 'paused';
      } else if (streamEndDate && streamEndDate.getTime() < new Date().getTime()) {
        state = 'ended';
      } else if (startDate && startDate.getTime() > new Date().getTime()) {
        state = 'scheduled';
      } else if (estimate.currentAmountPerSecond === 0n) {
        state = 'out-of-funds';
      } else if (estimate.currentAmountPerSecond > 0n) {
        state = 'active';
      }
    }
  }

  const colorMap = {
    paused: 'color-caution',
    active: 'color-positive',
    ended: 'color-foreground',
    scheduled: 'color-caution',
    'out-of-funds': 'color-negative',
  } as const;
  $: stateColor = state ? colorMap[state] : undefined;

  const stateLabels = {
    paused: 'Paused',
    active: 'Active',
    ended: 'Ended',
    scheduled: 'Scheduled',
    'out-of-funds': 'Out of funds',
  } as const;
  $: stateLabel = state ? stateLabels[state] : undefined;
</script>

{#if state && !(state === 'active' && hideActive)}
  <div class="stream-state-badge {size}" style:background-color={`var(--${stateColor}-level-1`}>
    <div class="dot" style:background-color={`var(--${stateColor}-level-6`} />
    <span
      class={size === 'normal' ? 'typo-text-bold' : 'typo-text-small-bold'}
      style:color={`var(--${stateColor}-level-6`}>{stateLabel}</span
    >
  </div>
{/if}

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

  .stream-state-badge.small {
    height: 1.5rem;
    padding: 0 0.5rem;
    gap: 0.375rem;
  }

  .dot {
    height: 0.5rem;
    width: 0.5rem;
    border-radius: 0.25rem;
  }

  .small .dot {
    height: 0.375rem;
    width: 0.375rem;
  }
</style>
