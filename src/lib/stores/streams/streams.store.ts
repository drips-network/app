import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import { derived, get, writable } from 'svelte/store';
import * as metadata from './metadata';
import type { Account, Stream, UserId } from './types';
import assert from '$lib/utils/assert';

interface State {
  accounts: { [userId: UserId]: Account };
  ownStreams?: {
    incoming: Stream[];
    outgoing: Stream[];
  };
}

type AccountFetchStatus = 'fetching' | 'error' | 'fetched';

export default (() => {
  const userId = writable<string | undefined>(undefined);
  const accounts = writable<{ [accountId: UserId]: Account }>({});
  const state = derived<[typeof accounts, typeof userId], State>(
    [accounts, userId],
    ([accounts, userId]) => {
      const newState: State = {
        accounts,
      };

      if (userId) {
        newState.ownStreams = getStreamsForUser(userId);
      }

      return newState;
    },
  );

  /**
   * A store that includes drips user IDs and their current AccountFetchStatus. Only
   * includes accounts explicitly fetched via `fetchAccount`, not any secondary accounts
   * merely fetched as dependencies to top-level accounts.
   */
  const fetchStatuses = writable<{ [key: UserId]: AccountFetchStatus }>({});

  /**
   * Connect the store to a user, and fetch the currently-connected user's account
   * and all incoming streams.
   * @param toUserId The user ID to connect to.
   */
  async function connect(toUserId: string) {
    userId.set(toUserId);

    await fetchAccount(toUserId);
  }

  /**
   * Disconnect the store from the current user's account.
   */
  async function disconnect() {
    userId.set(undefined);
  }

  /**
   * Fetches an account, and all accounts streaming to it.
   * @param userId The user ID to fetch.
   */
  async function fetchAccount(userId: UserId): Promise<Account> {
    fetchStatuses.update((fs) => ({ ...fs, [userId]: 'fetching' }));

    try {
      const account = await _fetchAccount(userId);

      const subgraphClient = getSubgraphClient();
      const dripsReceiverSeenEventForUser =
        await subgraphClient.getDripsReceiverSeenEventsByReceiverId(userId);
      const accountsSendingToCurrentUser = dripsReceiverSeenEventForUser.reduce<string[]>(
        (acc, event) => {
          const senderUserId = event.senderUserId.toString();
          return !acc.includes(senderUserId) ? [...acc, senderUserId] : acc;
        },
        [],
      );

      await Promise.all(accountsSendingToCurrentUser.map((a) => _fetchAccount(a)));

      fetchStatuses.update((fs) => ({ ...fs, [userId]: 'fetched' }));
      return account;
    } catch (e) {
      fetchStatuses.update((fs) => ({ ...fs, [userId]: 'error' }));
      throw e;
    }
  }

  function getAllStreams(fromState = get(state)) {
    const state = fromState;
    const { accounts } = state;

    return Object.values(accounts).reduce<Stream[]>(
      (streams, account) => [
        ...streams,
        ...account.assetConfigs.reduce<Stream[]>(
          (acc, assetConfig) => [...acc, ...assetConfig.streams],
          [],
        ),
      ],
      [],
    );
  }

  function getStreamsForUser(userId: string) {
    const allStreams = getAllStreams();

    return {
      incoming: allStreams.filter((s) => s.receiver.userId === userId),
      outgoing: allStreams.filter((s) => s.sender.userId === userId),
    };
  }

  /**
   * Refreshes the currently-connected user's account information.
   */
  async function refreshUserAccount(): Promise<Account> {
    const currentUserId = get(userId);
    assert(currentUserId, 'Store needs to be connected first.');

    const account = await fetchAccount(currentUserId);

    return account;
  }

  /** @private */
  async function _fetchAccount(userId: UserId): Promise<Account> {
    const account = await metadata.fetchAccount(userId);

    accounts.update((s) => ({ ...s, [userId]: account }));

    return account;
  }

  return {
    subscribe: state.subscribe,
    fetchStatuses: { subscribe: fetchStatuses.subscribe },
    connect,
    disconnect,
    getAllStreams,
    getStreamsForUser,
    fetchAccount,
    refreshUserAccount,
  };
})();
