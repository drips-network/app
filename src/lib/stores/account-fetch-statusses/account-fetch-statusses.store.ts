import tuple from '$lib/utils/tuple';
import { derived } from 'svelte/store';
import balances from '../balances';
import streams from '../streams';
import type { UserId } from '../streams/types';

export type AccountFetchStatus = 'fetching' | 'error' | 'fetched';

type State = {
  [key: UserId]: {
    /** The fetch status from the `streams` store. */
    information: AccountFetchStatus;
    /** The fetch status from the `balances` store. */
    balances: AccountFetchStatus;
    /** Overall fetch status. Is `fetched` if both stores report having fetched the account fully. */
    all: AccountFetchStatus;
  };
};

/**
 * This store aggregates the "fetch stauses" of the two stores relevant for displaying all information
 * for a given user: "balances", and "streams".
 *
 * - "Streams" includes stream information, like its metadata and on-chain attributes. An account is
 *   considered "fetched" by the streams store when its metadata and relevant on-chain data has been
 *   fetched.
 * - "Balances" includes a real-time balance estimate for all streams in the "streams" store. An account
 *   is considered "fetched" by the balances store if its receivable & splittable balances, as well as
 *   its squeeze history has been successfully fetched from the contract. These values are all required
 *   in order to produce an accurate incoming balance estimate.
 *
 * From these values, this store generates an object for each account which includes the individual
 * fetch stauses from both stores, as well as an overall status value. This value is true if the account
 * is fetched in both stores, and either `fetching` or `error` if one of those is the status in either
 * store.
 */
const store = derived<[typeof streams.fetchStatusses, typeof balances.fetchStatusses], State>(
  [streams.fetchStatusses, balances.fetchStatusses],
  ([streamsFetchStatusses, balancesFetchStauses]) => {
    const allUserIds = [
      Object.keys(streamsFetchStatusses),
      Object.keys(balancesFetchStauses),
    ].flat();

    const newState: State = {};

    for (const userId of allUserIds) {
      let overallStatus: AccountFetchStatus;

      const fetchStauses = tuple(
        streamsFetchStatusses[userId] ?? 'fetching',
        balancesFetchStauses[userId] ?? 'fetching',
      );

      if (fetchStauses.filter((s) => s === 'fetched').length === 2) {
        overallStatus = 'fetched';
      } else if (fetchStauses.find((s) => s === 'error')) {
        overallStatus = 'error';
      } else if (fetchStauses.find((s) => s === 'fetching')) {
        overallStatus = 'fetching';
      } else {
        overallStatus = 'fetching';
      }

      newState[userId] = {
        information: fetchStauses[0],
        balances: fetchStauses[1],
        all: overallStatus,
      };
    }

    return newState;
  },
);

export default store;
