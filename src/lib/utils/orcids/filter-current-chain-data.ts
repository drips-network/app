import type { SupportedChain } from '$lib/graphql/__generated__/base-types';
import network from '$lib/stores/wallet/network';
import assert from '$lib/utils/assert';
import isClaimed, { isUnclaimed } from './is-claimed';

function isOrcidData(data: {
  __typename: string;
}): data is { __typename: 'ClaimedOrcidAccountData' | 'UnClaimedOrcidAccountData' } {
  return data.__typename === 'ClaimedOrcidAccountData' || data.__typename === 'UnClaimedOrcidAccountData';
}

export default function filterCurrentChainData<
  T extends
    | { __typename: string; chain: SupportedChain }
    | { __typename: string; chain: SupportedChain },
  /** If filtering ORCID chain data, use this to enforce a claimed / unclaimed status. Must be undefined if not ORCID data. */
  CT extends 'claimed' | 'unclaimed' | undefined,
>(
  items: T[],
  expectedOrcidStatus?: CT,
  chainOverride?: SupportedChain,
): CT extends 'claimed'
  ? T & { __typename: 'ClaimedOrcidAccountData' }
  : CT extends 'unclaimed'
    ? T & { __typename: 'UnClaimedOrcidAccountData' }
    : T {
  const expectedChain = chainOverride ?? network.gqlName;

  const filteredItems = items.filter((item) => item.chain === expectedChain);
  const item = filteredItems[0];

  assert(item, `Expected ORCID data for chain ${expectedChain}, ${JSON.stringify(items[0])}`);

  if (expectedOrcidStatus) {
    assert(isOrcidData(item), 'Expected ORCID data');
    assert(
      expectedOrcidStatus === 'unclaimed' ? isUnclaimed(item) : isClaimed(item),
      `Expected ${expectedOrcidStatus} ORCID data`,
    );
  }

  return item as CT extends 'claimed'
    ? T & { __typename: 'ClaimedOrcidAccountData' }
    : CT extends 'unclaimed'
      ? T & { __typename: 'UnClaimedOrcidAccountData' }
      : T;
}
