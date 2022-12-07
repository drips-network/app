import type { AddressDriverClient, DripsHubClient } from 'radicle-drips';
import { get, readable, writable, type Readable } from 'svelte/store';
import assert from '$lib/utils/assert';
import { estimateAccount, type AssetConfigEstimates, type StreamEstimate } from './utils/estimate';
import tickStore from '../tick/tick.store';
import type { Account, StreamId, UserId } from '../streams/types';
import { decodeStreamId } from '../streams/methods/make-stream-id';
import { getAddressDriverClient, getDripsHubClient } from '$lib/utils/get-drips-clients';
import streams from '$lib/stores/streams';
import unreachable from '$lib/utils/unreachable';

interface Amount {
  amount: bigint;
  tokenAddress: string;
}

interface MockSqueezeEvent {
  timestamp: Date;
  amountSqueezed: bigint;
}

interface State {
  receivable: Amount[];
  splittable: Amount[];
  streamable: Amount[];
  squeezeHistory: MockSqueezeEvent[];
  accounts: { [userId: string]: { [tokenAddress: string]: AssetConfigEstimates } };
}

const INITIAL_STATE = {
  receivable: [],
  streamable: [],
  splittable: [],
  squeezeHistory: [],
  accounts: {},
};

export default (() => {
  let addressDriverClient: AddressDriverClient | undefined;
  let dripsHubClient: DripsHubClient | undefined;

  let currentCycle: { start: Date; durationMillis: number } | undefined;
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

    await Promise.all([updateCycle(), updateBalances(), updateSqueezeHistory()]);
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

  async function updateCycle() {
    // Grabbing a new client here because updating cycle should work with a readonly client while disconnected.
    const dripsHubClient = await getDripsHubClient();

    const cycleSecs = await dripsHubClient.cycleSecs();
    const currentCycleSecs = Math.floor(new Date().getTime() / 1000) % cycleSecs;
    const currentCycleStart = new Date(new Date().getTime() - Number(currentCycleSecs) * 1000);

    currentCycle = {
      start: currentCycleStart,
      durationMillis: cycleSecs * 1000,
    };
  }

  /** Update the current receivable balances for the currently connected user. */
  async function updateBalances() {
    assert(dripsHubClient && userId, 'Store must be connected first');

    // TODO: Remove explicit maxCycles once SDK no longer has overflow bug with the default value
    const allReceivableBalancesRes = await dripsHubClient.getAllReceivableBalancesForUser(
      userId,
      10000,
    );
    const allSplittableBalancesRes = await dripsHubClient.getAllSplittableBalancesForUser(userId);

    state.update((s) => ({
      ...s,
      receivable: allReceivableBalancesRes.map((b) => ({
        amount: b.receivableAmount,
        tokenAddress: b.tokenAddress,
        multiplier: 1n,
      })),
      splittable: allSplittableBalancesRes.map((b) => ({
        amount: b.splittableAmount,
        tokenAddress: b.tokenAddress,
        multiplier: 1n,
      })),
    }));
  }

  // TODO: Real implementation
  async function updateSqueezeHistory() {
    state.update((s) => ({ ...s, squeezeHistory: [] }));
  }

  /**
   * Find the estimate for a stream across all fetched accounts by its ID.
   * @param id The ID to find.
   * @returns The estimate for the stream, or undefined if it hasn't been estimated.
   */
  function getEstimateByStreamId(
    id: StreamId,
    mode: 'total' | 'currentCycle' = 'total',
  ): StreamEstimate | undefined {
    const { senderUserId, tokenAddress } = decodeStreamId(id);

    return get(state).accounts[senderUserId]?.[tokenAddress]?.[mode].streams.find(
      (s) => s.id === id,
    );
  }

  function getIncomingBalanceForUser(tokenAddress: string, userId: string) {
    const ownStreams = streams.getStreamsForUser(userId);

    const incomingStreamsForToken = ownStreams.incoming.filter(
      (stream) => stream.dripsConfig.amountPerSecond.tokenAddress === tokenAddress,
    );

    const currentCycleEstimate = incomingStreamsForToken.reduce<{
      amtPerSec: bigint;
      total: bigint;
    }>(
      (acc, stream) => {
        const estimate = getEstimateByStreamId(stream.id, 'currentCycle');

        return {
          amtPerSec: acc.amtPerSec + (estimate?.currentAmountPerSecond ?? 0n),
          total: acc.total + (estimate?.totalStreamed ?? 0n),
        };
      },
      { amtPerSec: 0n, total: 0n },
    );

    if (!currentCycleEstimate) return undefined;

    const { receivable, splittable } = get(state);
    const receivableForToken =
      receivable.find((t) => t.tokenAddress === tokenAddress)?.amount ?? 0n;
    const splittableForToken =
      splittable.find((t) => t.tokenAddress === tokenAddress)?.amount ?? 0n;

    // TODO: Subtract squeezed amount

    return {
      totalEarned: receivableForToken + splittableForToken + currentCycleEstimate.total,
      amountPerSecond: currentCycleEstimate.amtPerSec,
    };
  }

  /** @private */
  function _updateAccountBalances() {
    if (!currentCycle) return;

    const newAccounts = Object.fromEntries(
      Object.values(get(accounts)).map((account) => [
        account.user.userId,
        estimateAccount(account, {
          start: currentCycle?.start ?? unreachable(),
          duration: currentCycle?.durationMillis ?? unreachable(),
        }),
      ]),
    );

    state.update((s) => ({
      ...s,
      accounts: newAccounts,
    }));
  }

  /** @private */
  function _updateStreamableBalances() {
    const account = get(state).accounts[userId ?? ''];
    if (!account) return;

    const streamable = Object.entries(account).map<Amount>(([tokenAddress, estimate]) => ({
      tokenAddress,
      amount: estimate.total.totals.remainingBalance,
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
    getIncomingBalanceForUser,
    updateSqueezeHistory,
    connect,
    disconnect,
    updateCycle,
    updateBalances,
  };
})();
