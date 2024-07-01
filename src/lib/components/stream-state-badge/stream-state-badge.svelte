<script lang="ts" context="module">
  import { gql } from 'graphql-request';

  export const STREAM_STATE_BADGE_STREAM_FRAGMENT = gql`
    ${STREAM_STATE_STREAM_FRAGMENT}
    fragment StreamStateBadgeStream on Stream {
      ...StreamStateStream
      config {
        amountPerSecond {
          tokenAddress
        }
      }
    }
  `;
</script>

<script lang="ts">
  import streamState, {
    STREAM_STATE_LABELS,
    STREAM_STATE_STREAM_FRAGMENT,
  } from '$lib/utils/stream-state';
  import StatusBadge from '../status-badge/status-badge.svelte';
  import type { StreamStateBadgeStreamFragment } from './__generated__/gql.generated';
  import { streamCurrentAmountsStore } from '$lib/utils/current-amounts';

  export let stream: StreamStateBadgeStreamFragment;

  export let hideActive = false;
  export let size: 'small' | 'normal' | 'large' = 'normal';

  const streamReadable = streamCurrentAmountsStore(
    stream.timeline,
    stream.config.amountPerSecond.tokenAddress,
  );

  // listen to updates of the stream's current realtime state and update the state
  $: state = $streamReadable && streamState(stream);

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
