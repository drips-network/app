import balancesStore from '$lib/stores/balances/balances.store';
import tokensStore from '$lib/stores/tokens/tokens.store';
import { derived } from 'svelte/store';
import mapFilterUndefined from '../map-filter-undefined';
import deduplicateReadable from '../deduplicate-readable';
import fiatEstimates from './fiat-estimates';

const allRelevantTokens = deduplicateReadable(
  derived([balancesStore], ([$balancesStore]) => {
    const allTokenAddresses = Object.values($balancesStore.accounts).reduce<string[]>(
      (acc, account) => [...acc, ...Object.keys(account.tokens)],
      [],
    );

    const symbols = mapFilterUndefined(
      allTokenAddresses,
      (tokenAddress) => tokensStore.getByAddress(tokenAddress)?.info.symbol,
    );

    return symbols;
  }),
);

let unsubscriber: (() => void) | undefined;
let previousTokens: string[] = [];

/**
 * Begin automatically tracking and untracking tokens as they are added and removed from the accounts
 * currently stored in memory.
 */
function start() {
  unsubscriber = allRelevantTokens.subscribe((v) => {
    const tokensToTrack = v.filter((token) => !previousTokens.includes(token));
    const tokensToUntrack = previousTokens.filter((token) => !v.includes(token));

    if (tokensToTrack.length > 0) fiatEstimates.track(tokensToTrack);
    if (tokensToUntrack.length > 0) fiatEstimates.untrack(tokensToUntrack);

    previousTokens = v;
  });
}

function stop() {
  unsubscriber?.();
  unsubscriber = undefined;

  fiatEstimates.untrack(previousTokens);

  previousTokens = [];
}

export default {
  start,
  stop,
};
