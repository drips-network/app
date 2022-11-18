import type { AddressDriverClient, DripsHubClient } from 'radicle-drips';
import { get, readable, writable, type Readable } from 'svelte/store';
import assert from '$lib/utils/assert';
import { estimateAccount, type AssetConfigEstimate, type StreamEstimate } from './utils/estimate';
import tickStore from '../tick/tick.store';
import type { Account, StreamId, UserId } from '../streams/types';
import { decodeStreamId } from '../streams/methods/make-stream-id';
import { getAddressDriverClient, getDripsHubClient } from '$lib/utils/get-drips-clients';
import streams from '$lib/stores/streams';

interface Amount {
  amount: bigint;
  tokenAddress: string;
}

interface State {
  receivable: Amount[];
  streamable: Amount[];
  accounts: { [userId: string]: { [tokenAddress: string]: AssetConfigEstimate } };
}

const INITIAL_STATE = {
  receivable: [],
  streamable: [],
  accounts: {},
};

export default (() => {
  let addressDriverClient: AddressDriverClient | undefined;
  let dripsHubClient: DripsHubClient | undefined;

  let userId: string | undefined;
  let accounts: Readable<{ [accountId: UserId]: Account }> = readable({});
  let tickRegistration: number | undefined;
  const state = writable<State>(INITIAL_STATE);

  if (!tickRegistration) tickRegistration = tickStore.register(_updateAllBalances);

  /**
   * Connect the store to a given AddressDriverClient and fetch balances.
   */
  async function connect() {
    addressDriverClient = await getAddressDriverClient();
    dripsHubClient = await getDripsHubClient();

    userId = (await addressDriverClient.getUserId()).toString();

    await updateBalances();
  }

  /**
   * Set a readable of accounts for which balances should be estimated
   * recurringly.
   * @param toAccounts The accounts readable to connect to.
   */
  async function setAccounts(toAccounts: Readable<{ [accountId: UserId]: Account }>) {
    accounts = toAccounts;
  }

  /** Disconnect from the provided addressDriverClient and clear the store. */
  function disconnect() {
    addressDriverClient = undefined;
    userId = undefined;
    if (tickRegistration) tickStore.deregister(tickRegistration);
    tickRegistration = undefined;

    state.update((s) => ({
      ...s,
      receivable: [],
      streamable: [],
    }));
  }

  /** Update the current receivable balances for the currently connected user. */
  async function updateBalances() {
    assert(dripsHubClient && userId, 'Store must be connected first');

    // TODO: Remove explicit maxCycles once SDK no longer has overflow bug with the default value
    const allBalancesRes = await dripsHubClient.getAllReceivableBalancesForUser(userId, 10000);

    state.update((s) => ({
      ...s,
      receivable: allBalancesRes.map((b) => ({
        amount: b.receivableAmount,
        tokenAddress: b.tokenAddress,
        multiplier: 1n,
      })),
      streamable: s?.streamable ?? [],
      accounts: s?.accounts ?? {},
    }));
  }

  /**
   * Find the estimate for a stream across all fetched accounts by its ID.
   * @param id The ID to find.
   * @returns The estimate for the stream, or undefined if it hasn't been estimated.
   */
  function getEstimateByStreamId(id: StreamId): StreamEstimate | undefined {
    const { senderUserId, tokenAddress } = decodeStreamId(id);

    return get(state).accounts[senderUserId]?.[tokenAddress]?.streams.find((s) => s.id === id);
  }

  /**
   * Get and calculate a user's total incoming amount and total incoming amounts-per-second
   * @param id The user's ID
   * @param address The Token's address
   * @returns The total income earned and total incoming rate
   */
  function getIncomingTokenAmountsByUser(
    userId: string,
    address: string,
  ): {
    totalEarned: bigint;
    amountPerSecond: bigint;
  } {
    const ownStreams = streams.getStreamsForUser(userId);

    if (!ownStreams) return { totalEarned: 0n, amountPerSecond: 0n };

    const incomingStreamsForToken = ownStreams.incoming.filter(
      (stream) => stream.dripsConfig.amountPerSecond.tokenAddress === address,
    );

    return incomingStreamsForToken.reduce<{ totalEarned: bigint; amountPerSecond: bigint }>(
      (acc, stream) => {
        const estimate = getEstimateByStreamId(stream.id);

        if (!estimate) throw new Error(`Unknown estimate for stream ${stream.id}`);

        return {
          totalEarned: acc.totalEarned + estimate.totalStreamed,
          amountPerSecond: acc.amountPerSecond + estimate.currentAmountPerSecond,
        };
      },
      { totalEarned: 0n, amountPerSecond: 0n },
    );
  }

  /** @private */
  function _updateAccountBalances() {
    state.update((s) => ({
      ...s,
      accounts: Object.fromEntries(
        Object.values(get(accounts)).map((account) => [
          account.user.userId,
          estimateAccount(account),
        ]),
      ),
    }));
  }

  /** @private */
  function _updateStreamableBalances() {
    const account = get(state).accounts[userId ?? ''];
    if (!account) return;

    const streamable = Object.entries(account).map<Amount>(([tokenAddress, estimate]) => ({
      tokenAddress,
      amount: estimate.totals.remainingBalance,
    }));

    state.update((s) => ({
      ...s,
      streamable,
    }));
  }

  /** @private */
  function _updateAllBalances() {
    _updateAccountBalances();
    _updateStreamableBalances();
  }

  return {
    subscribe: state.subscribe,
    setAccounts,
    getEstimateByStreamId,
    getIncomingTokenAmountsByUser,
    connect,
    disconnect,
    updateBalances,
  };
})();
