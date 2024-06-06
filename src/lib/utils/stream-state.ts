import { gql } from 'graphql-request';
import type { StreamStateStreamFragment } from './__generated__/gql.generated';
import {
  CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT,
  currentAmounts as getCurrentAmounts,
} from '$lib/utils/current-amounts';
import { TimelineItemType } from '$lib/graphql/__generated__/base-types';

type StreamState = 'paused' | 'ended' | 'scheduled' | 'out-of-funds' | 'active';

export const STREAM_STATE_STREAM_FRAGMENT = gql`
  ${CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT}
  fragment StreamStateStream on Stream {
    isPaused
    config {
      durationSeconds
      startDate
      amountPerSecond {
        tokenAddress
      }
    }
    timeline {
      ...CurrentAmountsTimelineItem
    }
  }
`;

export default function streamState(stream: StreamStateStreamFragment) {
  let state: StreamState;

  // TODO(streams): If duration seconds sewt but startDate undefined, fall back to stream creation date
  const endDate = stream.config.durationSeconds
    ? new Date(stream.config.startDate + stream.config.durationSeconds * 1000)
    : undefined;

  const currentAmounts = getCurrentAmounts(
    stream.timeline,
    stream.config.amountPerSecond.tokenAddress,
  );

  if (stream.isPaused) {
    state = 'paused';
  } else if (endDate && endDate.getTime() < new Date().getTime()) {
    state = 'ended';
  } else if (stream.config.startDate && stream.config.startDate.getTime() > new Date().getTime()) {
    state = 'scheduled';
  } else if (currentAmounts.lastTimelineItemType === TimelineItemType.OutOfFunds) {
    state = 'out-of-funds';
  } else if (currentAmounts.currentAmount.amount > 0n) {
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
