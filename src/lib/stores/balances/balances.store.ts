import type { AddressDriverClient } from 'radicle-drips';
import { get, readable, writable, type Readable } from 'svelte/store';
import assert from '$lib/utils/assert';
import { estimateAccount, type AccountEstimation } from './utils/estimate';
import tickStore from '../tick/tick.store';
import type { Account, UserId } from '../streams/types';

interface Amount {
  amount: bigint;
  tokenAddress: string;
}

interface State {
  receivable: Amount[];
  streamable: Amount[];
  accounts: { [userId: string]: AccountEstimation };
}

const INITIAL_STATE = {
  receivable: [],
  streamable: [],
  accounts: {},
};

export default (() => {
  let addressDriverClient: AddressDriverClient | undefined;
  let userId: string | undefined;
  let accounts: Readable<{ [accountId: UserId]: Account }> = readable({});
  const state = writable<State>(INITIAL_STATE);

  tickStore.register(_updateAccountBalances);

  /**
   * Connect the store to a given AddressDriverClient and fetch balances.
   * @param toAddressDriverClient The AddressDriverClient to connect to.
   */
  async function connect(toAddressDriverClient: AddressDriverClient) {
    addressDriverClient = toAddressDriverClient;
    userId = (await addressDriverClient.getUserId()).toString();

    await updateReceivable();
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

    state.update((s) => ({
      ...s,
      receivable: [],
      streamable: [],
    }));
  }

  /** Update the current receivable balances for the currently connected user. */
  async function updateReceivable() {
    assert(addressDriverClient && userId, 'Store must be connected first');

    // TODO: Remove explicit maxCycles once SDK no longer has overflow bug with the default value
    const allBalancesRes = await addressDriverClient.dripsHub.getBalancesForUser(userId, 10000);

    state.update((s) => ({
      ...s,
      receivable: allBalancesRes.map((b) => ({
        amount: b.receivableDrips.receivableAmt,
        tokenAddress: b.tokenAddress,
      })),
      streamable: s?.streamable ?? [],
      accounts: s?.accounts ?? {},
    }));
  }

  /** @private */
  async function _updateAccountBalances() {
    const estimates = Object.fromEntries(
      Object.entries(get(accounts)).map(([userId, account]) => [userId, estimateAccount(account)]),
    );

    state.update((s) => ({
      ...s,
      accounts: estimates,
    }));
  }

  return {
    subscribe: state.subscribe,
    setAccounts,
    connect,
    disconnect,
    updateReceivable,
  };
})();
