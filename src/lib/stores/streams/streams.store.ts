import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import { derived, writable } from 'svelte/store';
import * as metadata from './metadata';
import type { Account, Stream, UserId } from './types';

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
    const accountsSendingToCurrentUser =
      await subgraphClient.getDripsReceiverSeenEventsByReceiverId(toUserId);

    await Promise.all(
      accountsSendingToCurrentUser.map((a) => fetchAccount(a.receiverUserId.toString())),
    );
  }

  async function disconnect() {
    userId.set(undefined);
  }

  async function fetchAccount(userId: UserId) {
    const account = await metadata.fetchAccount(userId);

    accounts.update((s) => ({ ...s, [userId]: account }));
  }

  return {
    subscribe: state.subscribe,
    connect,
    disconnect,
  };
})();
