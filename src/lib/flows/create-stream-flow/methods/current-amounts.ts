import { gql } from 'graphql-request';
import type {
  CurrentAmountsTimelineItemFragment,
  CurrentAmountsUserBalanceTimelineItemFragment,
} from './__generated__/gql.generated';
import { writable, type Unsubscriber } from 'svelte/store';
import tickStore from '$lib/stores/tick/tick.store';
import type { TimelineItemType } from '$lib/graphql/__generated__/base-types';

export const CURRENT_AMOUNTS_TIMELINE_ITEM_FRAGMENT = gql`
  fragment CurrentAmountsTimelineItem on TimelineItem {
    timestamp
    deltaPerSecond {
      tokenAddress
      amount
    }
    currentAmount {
      tokenAddress
      amount
    }
    type
  }
`;

export const CURRENT_AMOUNTS_USER_BALANCE_TIMELINE_ITEM_FRAGMENT = gql`
  fragment CurrentAmountsUserBalanceTimelineItem on UserBalanceTimelineItem {
    timestamp
    deltaPerSecond {
      tokenAddress
      amount
    }
    currentAmount {
      tokenAddress
      amount
    }
  }
`;

interface Amount {
  tokenAddress: string;
  amount: bigint;
}

export function currentAmounts(
  timeline: (CurrentAmountsTimelineItemFragment | CurrentAmountsUserBalanceTimelineItemFragment)[],
): {
  currentAmount: Amount;
  currentDeltaPerSecond: Amount;
  lastTimelineItemType: TimelineItemType | undefined;
} {
  const now = Date.now();

  const nextTimelineItemIndex = timeline.findIndex(
    (item) => new Date(item.timestamp).getTime() > now,
  );

  const currentlyActiveTimelineItem =
    nextTimelineItemIndex === -1
      ? timeline[timeline.length - 1]
      : timeline[nextTimelineItemIndex - 1];

  if (!currentlyActiveTimelineItem) {
    return {
      currentAmount: { tokenAddress: '', amount: BigInt(0) },
      currentDeltaPerSecond: { tokenAddress: '', amount: BigInt(0) },
      lastTimelineItemType: undefined,
    };
  }

  const millisSinceLastTimelineItem =
    now - new Date(currentlyActiveTimelineItem.timestamp).getTime();

  const lastAmount = BigInt(currentlyActiveTimelineItem.currentAmount.amount);

  const lastDeltaPerSecond = BigInt(currentlyActiveTimelineItem.deltaPerSecond.amount);

  const currentAmount =
    lastAmount + (lastDeltaPerSecond * BigInt(millisSinceLastTimelineItem)) / BigInt(1000);

  return {
    currentAmount: {
      tokenAddress: currentlyActiveTimelineItem.currentAmount.tokenAddress,
      amount: currentAmount,
    },
    currentDeltaPerSecond: {
      tokenAddress: currentlyActiveTimelineItem.deltaPerSecond.tokenAddress,
      amount: lastDeltaPerSecond,
    },
    lastTimelineItemType: currentlyActiveTimelineItem.type,
  };
}

export const streamCurrentAmountsStore = (
  timeline: (CurrentAmountsTimelineItemFragment | CurrentAmountsUserBalanceTimelineItemFragment)[],
) => {
  const state = writable<ReturnType<typeof currentAmounts>>(currentAmounts(timeline));

  let unsubscriber: Unsubscriber;
  let tickHandle: number;

  function subscribe(...args: Parameters<typeof state.subscribe>) {
    unsubscriber = state.subscribe(...args);

    tickHandle = tickStore.register(_update);

    return unsubscriber;
  }

  function unsubscribe() {
    unsubscriber?.();
    if (tickHandle) tickStore.deregister(tickHandle);
  }

  function _update() {
    state.set(currentAmounts(timeline));
  }

  return {
    subscribe,
    unsubscribe,
  };
};
