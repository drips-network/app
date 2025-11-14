<script lang="ts" module>
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


  interface Props {
    stream: StreamStateBadgeStreamFragment;
    hideActive?: boolean;
    size?: 'small' | 'normal' | 'large';
  }

  let { stream, hideActive = false, size = 'normal' }: Props = $props();

  const streamReadable = streamCurrentAmountsStore(
    stream.timeline,
    stream.config.amountPerSecond.tokenAddress,
  );

  // listen to updates of the stream's current realtime state and update the state
  let state = $derived($streamReadable && streamState(stream));

  const colorMap = {
    paused: 'caution',
    active: 'positive',
    ended: 'foreground',
    scheduled: 'caution',
    'out-of-funds': 'negative',
  } as const;
  let color = $derived(state ? colorMap[state] : undefined);

  let stateLabel = $derived(state ? STREAM_STATE_LABELS[state] : undefined);
</script>

{#if state && !(state === 'active' && hideActive)}
  <StatusBadge {size} {color}>
    {stateLabel}
  </StatusBadge>
{/if}
