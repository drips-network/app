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
        const allStreams = Object.values(accounts).reduce<Stream[]>(
          (streams, account) => [
            ...streams,
            ...account.assetConfigs.reduce<Stream[]>(
              (acc, assetConfig) => [...acc, ...assetConfig.streams],
              [],
            ),
          ],
          [],
        );

        newState.ownStreams = {
          incoming: allStreams.filter((s) => s.receiver.userId === userId),
          outgoing: allStreams.filter((s) => s.sender.userId === userId),
        };
      }

      return newState;
    },
  );

  async function connect(toUserId: string) {
    userId.set(toUserId);

    await fetchAccount(toUserId);

    const subgraphClient = getSubgraphClient();
    const dripsReceiverSeenEventForUser =
      await subgraphClient.getDripsReceiverSeenEventsByReceiverId(toUserId);
    const accountsSendingToCurrentUser = dripsReceiverSeenEventForUser.reduce<string[]>(
      (acc, event) => {
        const senderUserId = event.senderUserId.toString();
        return !acc.includes(senderUserId) ? [...acc, senderUserId] : acc;
      },
      [],
    );

    await Promise.all(accountsSendingToCurrentUser.map((a) => fetchAccount(a)));
  }

  async function disconnect() {
    userId.set(undefined);
  }

  async function fetchAccount(userId: UserId): Promise<Account> {
    const account = await metadata.fetchAccount(userId);

    accounts.update((s) => ({ ...s, [userId]: account }));

    return account;
  }

  async function refreshUserAccount(): Promise<Account> {
    const currentUserId = get(userId);
    assert(currentUserId, 'Store needs to be connected first.');

    const account = await fetchAccount(currentUserId);

    return account;
  }

  return {
    subscribe: state.subscribe,
    connect,
    disconnect,
    refreshUserAccount,
    fetchAccount,
  };
})();
