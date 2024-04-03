import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import { derived, get, writable } from 'svelte/store';
import type { Account, Stream, AccountId } from './types';
import assert from '$lib/utils/assert';
import type { AccountFetchStatus } from '../account-fetch-statusses/account-fetch-statusses.store';
import AddressDriverMetadataManager from '$lib/utils/metadata/AddressDriverMetadataManager';

interface State {
  accounts: { [accountId: AccountId]: Account };
  ownStreams?: {
    incoming: Stream[];
    outgoing: Stream[];
  };
}

export default (() => {
  const accountId = writable<string | undefined>(undefined);
  const accounts = writable<{ [accountId: AccountId]: Account }>({});
  const state = derived<[typeof accounts, typeof accountId], State>(
    [accounts, accountId],
    ([accounts, accountId]) => {
      const newState: State = {
        accounts,
      };

      if (accountId) {
        newState.ownStreams = getStreamsForUser(accountId);
      }

      return newState;
    },
  );

  /**
   * A store that includes drips user IDs and their current AccountFetchStatus. Only
   * includes accounts explicitly fetched via `fetchAccount`, not any secondary accounts
   * merely fetched as dependencies to top-level accounts.
   */
  const fetchStatusses = writable<{ [key: AccountId]: AccountFetchStatus }>({});

  /**
   * Connect the store to a user, and fetch the currently-connected user's account
   * and all incoming streams.
   * @param toAccountId The user ID to connect to.
   */
  async function connect(toAccountId: string) {
    accountId.set(toAccountId);

    await fetchAccount(toAccountId);
  }

  /**
   * Disconnect the store from the current user's account.
   */
  async function disconnect() {
    accountId.set(undefined);
  }

  /**
   * Fetches all accounts that are streaming to a given accountId
   * @param accountId The user ID to fetch.
   */
  async function fetchAccountsStreamingToAccountId(accountId: AccountId): Promise<Account[]> {
    const subgraphClient = getSubgraphClient();
    const streamReceiverSeenEventForUser =
      await subgraphClient.getStreamReceiverSeenEventsByReceiverId(accountId);

    const accountsSendingToCurrentUser = streamReceiverSeenEventForUser.reduce<string[]>(
      (acc, event) => {
        const senderAccountId = event.senderAccountId.toString();
        return !acc.includes(senderAccountId) ? [...acc, senderAccountId] : acc;
      },
      [],
    );

    return Promise.all(accountsSendingToCurrentUser.map((a) => _fetchAccount(a)));
  }

  /**
   * Fetches an account, and all accounts streaming to it.
   * @param accountId The user ID to fetch.
   */
  async function fetchAccount(accountId: AccountId): Promise<Account> {
    fetchStatusses.update((fs) => ({ ...fs, [accountId]: 'fetching' }));

    try {
      const account = await _fetchAccount(accountId);

      await fetchAccountsStreamingToAccountId(accountId);

      fetchStatusses.update((fs) => ({ ...fs, [accountId]: 'fetched' }));
      return account;
    } catch (e) {
      fetchStatusses.update((fs) => ({ ...fs, [accountId]: 'error' }));
      throw e;
    }
  }

  function getAssetConfig(accountId: string, tokenAddress: string) {
    return get(state).accounts[accountId].assetConfigs.find(
      (ac) => ac.tokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
    );
  }

  function getAllStreams() {
    const accountsValue = get(accounts);

    return Object.values(accountsValue).reduce<Stream[]>(
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

  function getStreamsForUser(accountId: string) {
    const allStreams = getAllStreams();

    return {
      incoming: allStreams.filter((s) => s.receiver.accountId === accountId),
      outgoing: allStreams.filter((s) => s.sender.accountId === accountId),
    };
  }

  function getStreamById(streamId: string) {
    return getAllStreams().find((stream) => stream.id === streamId);
  }

  /**
   * Refreshes the currently-connected user's account information.
   */
  async function refreshUserAccount(): Promise<Account> {
    const currentAccountId = get(accountId);
    assert(currentAccountId, 'Store needs to be connected first.');

    const account = await fetchAccount(currentAccountId);

    return account;
  }

  /** @private */
  async function _fetchAccount(accountId: AccountId): Promise<Account> {
    const account = await new AddressDriverMetadataManager().fetchAccount(accountId);

    accounts.update((s) => ({ ...s, [accountId]: account }));

    return account;
  }

  return {
    subscribe: state.subscribe,
    fetchStatusses: { subscribe: fetchStatusses.subscribe },
    connect,
    disconnect,
    getAllStreams,
    getStreamById,
    getAssetConfig,
    getStreamsForUser,
    fetchAccount,
    fetchAccountsStreamingToAccountId,
    refreshUserAccount,
  };
})();
