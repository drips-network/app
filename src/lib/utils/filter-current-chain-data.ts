import type { SupportedChain } from '$lib/graphql/__generated__/base-types';
import network from '$lib/stores/wallet/network';
import assert from '$lib/utils/assert';
import isClaimed, { isUnclaimed } from './project/is-claimed';

function isProjectData(data: {
  __typename: string;
}): data is { __typename: 'ClaimedProjectData' | 'UnClaimedProjectData' } {
  return data.__typename === 'ClaimedProjectData' || data.__typename === 'UnClaimedProjectData';
}

export default function filterCurrentChainData<
  T extends
    | { __typename: string; chain: SupportedChain }
    | { __typename: string; chain: SupportedChain },
  /** If filtering project chain data, use this to enforce a claimed / unclaimed status. Must be undefined if not project data. */
  CT extends 'claimed' | 'unclaimed' | undefined,
>(
  items: T[],
  expectedProjectStatus?: CT,
): CT extends 'claimed'
  ? T & { __typename: 'ClaimedProjectData' }
  : CT extends 'unclaimed'
    ? T & { __typename: 'UnClaimedProjectData' }
    : T {
  const filteredItems = items.filter((item) => item.chain === network.gqlName);
  const item = filteredItems[0];

  assert(item, 'Expected project data for current chain');

  if (expectedProjectStatus) {
    assert(isProjectData(item), 'Expected project data');
    assert(
      expectedProjectStatus === 'unclaimed' ? isUnclaimed(item) : isClaimed(item),
      `Expected ${expectedProjectStatus} project data`,
    );
  }

  return item as CT extends 'claimed'
    ? T & { __typename: 'ClaimedProjectData' }
    : CT extends 'unclaimed'
      ? T & { __typename: 'UnClaimedProjectData' }
      : T;
}
