import type balances from '$lib/stores/balances';
import type streamsStore from '$lib/stores/streams/streams.store';
import getStreamHistory from './stream-history';
import unreachable from './unreachable';

type StreamState = 'paused' | 'ended' | 'scheduled' | 'out-of-funds' | 'active';

export default function streamState(
  streamId: string,
  streamScheduledStart: Date | undefined,
  streamDurationSeconds: number | undefined,
  streamPaused: boolean,
  estimate: NonNullable<ReturnType<typeof balances.getEstimateByStreamId>>,
  streamAssetConfig: NonNullable<ReturnType<typeof streamsStore.getAssetConfig>>,
) {
  let state: StreamState;

  const streamHistory = getStreamHistory(streamAssetConfig, streamId);
  const streamCreated = streamHistory?.[0].timestamp;

  const streamStartDate = new Date(streamScheduledStart ?? streamCreated ?? unreachable());
  const streamEndDate = streamDurationSeconds
    ? new Date(streamStartDate.getTime() + streamDurationSeconds * 1000)
    : undefined;

  if (streamPaused) {
    state = 'paused';
  } else if (streamEndDate && streamEndDate.getTime() < new Date().getTime()) {
    state = 'ended';
  } else if (streamScheduledStart && streamScheduledStart.getTime() > new Date().getTime()) {
    state = 'scheduled';
  } else if (estimate.currentAmountPerSecond === 0n) {
    state = 'out-of-funds';
  } else if (estimate.currentAmountPerSecond > 0n) {
    state = 'active';
  } else {
    throw new Error('Invalid stream state');
  }

  return state;
}

export const STREAM_STATE_LABELS = {
  paused: 'Paused',
  active: 'Active',
  ended: 'Ended',
  scheduled: 'Scheduled',
  'out-of-funds': 'Out of funds',
} as const;
