<script lang="ts">
  import balances from '$lib/stores/balances/balances.store';
  import streams from '$lib/stores/streams';
  import streamState, { STREAM_STATE_LABELS } from '$lib/utils/stream-state';

  export let streamId: string;
  export let streamScheduledStart: Date | undefined = undefined;
  export let streamDurationSeconds: number | undefined = undefined;
  export let streamPaused: boolean;
  export let streamTokenAddress: string;
  export let streamSenderAccountId: string;

  export let hideActive = false;
  export let size: 'small' | 'normal' | 'large' = 'normal';

  $: assetConfig = $streams && streams.getAssetConfig(streamSenderAccountId, streamTokenAddress);
  $: estimate = $balances && balances.getEstimateByStreamId(streamId);

  $: state =
    estimate &&
    assetConfig &&
    streamState(
      streamId,
      streamScheduledStart,
      streamDurationSeconds,
      streamPaused,
      estimate,
      assetConfig,
    );

  const colorMap = {
    paused: 'color-caution',
    active: 'color-positive',
    ended: 'color-foreground',
    scheduled: 'color-caution',
    'out-of-funds': 'color-negative',
  } as const;
  $: stateColor = state ? colorMap[state] : undefined;

  $: stateLabel = state ? STREAM_STATE_LABELS[state] : undefined;

  const textClasses = {
    small: 'typo-text-small',
    normal: 'typo-text',
    large: 'typo-header-3',
  };
</script>

{#if state && !(state === 'active' && hideActive)}
  <div class="stream-state-badge {size}" style:background-color={`var(--${stateColor}-level-1`}>
    <div class="dot" style:background-color={`var(--${stateColor}-level-6`} />
    <span class={textClasses[size]} style:color={`var(--${stateColor}-level-6`}>{stateLabel}</span>
  </div>
{/if}

<style>
  .stream-state-badge {
    height: 2rem;
    border-radius: 2rem 0 2rem 2rem;
    display: flex;
    gap: 0.5rem;
    padding: 0 0.75rem;
    align-items: center;
    user-select: none;
    max-width: fit-content;
  }

  .stream-state-badge.small {
    height: 1.5rem;
    padding: 0 0.5rem;
    gap: 0.375rem;
  }

  .stream-state-badge.large {
    height: 3rem;
    padding: 0 1rem;
    gap: 0.5rem;
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
