<script lang="ts">
  import balances from '$lib/stores/balances/balances.store';
  import streams from '$lib/stores/streams';
  import streamState, { STREAM_STATE_LABELS } from '$lib/utils/stream-state';
  import StatusBadge from '../status-badge/status-badge.svelte';

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
    paused: 'caution',
    active: 'positive',
    ended: 'foreground',
    scheduled: 'caution',
    'out-of-funds': 'negative',
  } as const;
  $: color = state ? colorMap[state] : undefined;

  $: stateLabel = state ? STREAM_STATE_LABELS[state] : undefined;
</script>

{#if state && !(state === 'active' && hideActive)}
  <StatusBadge {size} {color}>
    {stateLabel}
  </StatusBadge>
{/if}
