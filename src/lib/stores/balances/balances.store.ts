import { constants, type SqueezedDripsEvent } from 'radicle-drips';
import { get, readable, writable, type Readable } from 'svelte/store';
import { estimateAccount, type AssetConfigEstimates, type StreamEstimate } from './utils/estimate';
import tickStore from '../tick/tick.store';
import type { Account, StreamId, UserId } from '../streams/types';
import { decodeStreamId } from '../streams/methods/make-stream-id';
import { getDripsHubClient, getSubgraphClient } from '$lib/utils/get-drips-clients';
import unreachable from '$lib/utils/unreachable';
import relevantTokens from './utils/relevant_tokens';
import fetchBalancesForTokens from './utils/fetch_balances_for_tokens';
import type { AccountFetchStatus } from '../account-fetch-statusses/account-fetch-statusses.store';

interface Amount {
  amount: bigint;
  tokenAddress: string;
}

interface AccountBalances {
  receivable?: Amount[];
  splittable?: Amount[];
  squeezeHistory?: SqueezedDripsEvent[];
  tokens: { [tokenAddress: string]: AssetConfigEstimates };
}

interface State {
  accounts: { [userId: string]: AccountBalances };
}

const INITIAL_STATE = {
  accounts: {},
};

export default (() => {
  let currentCycle:
    | {
        start: Date;
        /** Milliseconds */
        duration: number;
      }
    | undefined;

  let accounts: Readable<{ [accountId: UserId]: Account }> = readable({});
  let tickRegistration: number | undefined;
  const state = writable<State>(INITIAL_STATE);
  const fetchStatusses = writable<{ [key: UserId]: AccountFetchStatus }>({});

  // Once per tick, we run balance estimation logic.
  if (!tickRegistration) tickRegistration = tickStore.register(_updateAccountBalances);

  /**
   * Initialize the store. Once initialized, it's ready to estimate balances.
   */
  async function initialize() {
    await updateCycle();
  }

  /**
   * Set a readable of accounts for which balances should be estimated
   * recurringly.
   * @param toAccounts The accounts readable to connect to.
   */
  async function setAccounts(toAccounts: Readable<{ [accountId: UserId]: Account }>) {
    accounts = toAccounts;
  }

  /** Update the current receivable balances for the currently connected user. */
  async function updateBalances(forUserId: string) {
    const tokenAddresses = await Promise.all([
      relevantTokens('receivable', forUserId),
      relevantTokens('splittable', forUserId),
    ]);

    const balances = await Promise.all([
      fetchBalancesForTokens('receivable', tokenAddresses[0], forUserId),
      fetchBalancesForTokens('splittable', tokenAddresses[1], forUserId),
    ]);

    state.update((s) => {
      s.accounts[forUserId].receivable = balances[0].map((b) => ({
        amount: b.receivableAmount,
        tokenAddress: b.tokenAddress,
        multiplier: 1n,
      }));

      s.accounts[forUserId].splittable = balances[1].map((b) => ({
        amount: b.splittableAmount,
        tokenAddress: b.tokenAddress,
        multiplier: 1n,
      }));

      return s;
    });
  }

  /**
   * Update the squeeze history for a given account.
   * @param forUserId The user ID to update the squeeze history for.
   */
  async function updateSqueezeHistory(forUserId: string) {
    const subgraph = getSubgraphClient();

    const squeezedEvents = (await subgraph.getSqueezedDripsEventsByUserId(forUserId)).sort(
      (a, b) => Number(a.blockTimestamp) - Number(b.blockTimestamp),
    );

    state.update((s) => {
      s.accounts[forUserId].squeezeHistory = squeezedEvents;
      return s;
    });
  }

  // Ensure that squeeze history and balances are kept up to date for newly-added accounts.
  state.subscribe(async (s) => {
    const accounts = Object.keys(s.accounts);

    for (const userId of accounts) {
      const currentFetchStatus = get(fetchStatusses)[userId];
      if (['fetching', 'fetched'].includes(currentFetchStatus)) continue;

      fetchStatusses.update((fs) => ({ ...fs, [userId]: 'fetching' }));

      try {
        await Promise.all([updateSqueezeHistory(userId), updateBalances(userId)]);
      } catch (e) {
        fetchStatusses.update((fs) => ({ ...fs, [userId]: 'error' }));
        throw e;
      }

      fetchStatusses.update((fs) => ({ ...fs, [userId]: 'fetched' }));
    }
  });

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

    return get(state).accounts[senderUserId]?.tokens[tokenAddress]?.[mode].streams.find(
      (s) => s.id === id,
    );
  }

  /**
   * Retrieve ALL stream estimates currently in the state as an array.
   * @param mode Which estimate to fetch; currentCycle only, or total.
   * @returns An array of all stream estimates with the provided mode.
   */
  function getAllStreamEstimates(mode: 'total' | 'currentCycle' = 'total'): StreamEstimate[] {
    return Object.values(get(state).accounts)
      .map((accountEstimate) => Object.values(accountEstimate.tokens))
      .flat()
      .map((assetConfigEstimates) => assetConfigEstimates[mode])
      .map((currentCycleEstimate) => currentCycleEstimate.streams)
      .flat();
  }

  /**
   * Get stream estimates for all streams streaming to a given receiver.
   * @param userId The receiver's User ID to get streams for.
   * @returns The relevant stream estimate objects.
   */
  function getStreamEstimatesByReceiver(mode: 'total' | 'currentCycle', userId: string) {
    const allStreamEstimates = getAllStreamEstimates(mode);

    return allStreamEstimates.filter((se) => se.receiver.userId === userId);
  }

  /**
   * Calculate an estimate of the current incoming balance for the given user and
   * token address. This estimate is equal to what the user could currently collect
   * if they were to **squeeze all their incoming streams**, but **before splitting**.
   * It includes funds earned from incoming splits and gives, and also takes any squeezes
   * during the current cycle into account.
   * @param tokenAddress The token address of the balance to fetch estimates for.
   * @param userId The user ID of the user to get balances for.
   * @returns The incoming balance total and current amount per second, or undefined
   * if the receivable & splittable balances for the account haven't yet been fetched.
   */
  function getIncomingBalanceForUser(tokenAddress: string, userId: string) {
    const accountBalances = get(state).accounts[userId];
    if (!accountBalances) return;

    const { receivable, splittable, squeezeHistory } = accountBalances;
    if (!receivable || !splittable || !squeezeHistory) return;

    const incomingStreamsForToken = getStreamEstimatesByReceiver('currentCycle', userId).filter(
      (streamEstimate) => streamEstimate.tokenAddress === tokenAddress,
    );

    // Sum up the total streamed by relevant incoming streams
    const currentCycleEstimate = incomingStreamsForToken.reduce<{
      amtPerSec: bigint;
      total: bigint;
    }>(
      (acc, stream) => {
        return {
          amtPerSec: acc.amtPerSec + (stream.currentAmountPerSecond ?? 0n),
          total: acc.total + (stream.totalStreamed ?? 0n),
        };
      },
      { amtPerSec: 0n, total: 0n },
    );

    // Retrieve the user's `streamable` and `splittable` balances for the given token
    const receivableForToken =
      (receivable.find((t) => t.tokenAddress === tokenAddress)?.amount ?? 0n) *
      BigInt(constants.AMT_PER_SEC_MULTIPLIER);
    const splittableForToken =
      (splittable.find((t) => t.tokenAddress === tokenAddress)?.amount ?? 0n) *
      BigInt(constants.AMT_PER_SEC_MULTIPLIER);

    const cycle = currentCycle ?? unreachable();

    // Calculate how much of the token the user has squeezed this cycle
    const squeezesInCurrentCycle = squeezeHistory.filter(
      (hi) => Number(hi.blockTimestamp) * 1000 >= cycle.start.getTime(),
    );
    const totalAmountSqueezed = squeezesInCurrentCycle.reduce<bigint>(
      (acc, hi) => acc + hi.amount * BigInt(constants.AMT_PER_SEC_MULTIPLIER),
      0n,
    );

    return {
      /*
      The total earned is everything
      - `receivable` (earned & not received in previous cycle)
      - `splittable` (already-received but not-yet-split income, or income from incoming split & gives)
      - everything streamed to the user in the current cycle, which is not yet included in figures
        reported by the contract
      - MINUS any funds the user has squeezed in the current cycle (which is substracted from the total
        earned amount in order to not be double-counted)
      */
      totalEarned:
        receivableForToken + splittableForToken + currentCycleEstimate.total - totalAmountSqueezed,
      amountPerSecond: currentCycleEstimate.amtPerSec,
    };
  }

  /**
   * The balances store internally fetches information about the current DripsHub cycle in order to
   * accurately estimate incoming balances. This function forces an update of the cycle information fetched on
   * when the store was initialized.
   */
  async function updateCycle() {
    const dripsHubClient = await getDripsHubClient();

    const cycleSecs = await dripsHubClient.cycleSecs();
    const currentCycleSecs = Math.floor(new Date().getTime() / 1000) % cycleSecs;
    const currentCycleStart = new Date(new Date().getTime() - Number(currentCycleSecs) * 1000);

    currentCycle = {
      start: currentCycleStart,
      duration: cycleSecs * 1000,
    };
  }

  /** @private */
  function _updateAccountBalances() {
    state.update((s) => {
      if (!currentCycle) return s;

      return {
        ...s,
        accounts: Object.fromEntries(
          Object.values(get(accounts)).map((account) => [
            account.user.userId,
            {
              ...get(state).accounts[account.user.userId],
              tokens: estimateAccount(account, currentCycle ?? unreachable()),
            },
          ]),
        ),
      };
    });
  }

  return {
    subscribe: state.subscribe,
    fetchStatusses: { subscribe: fetchStatusses.subscribe },
    initialize,
    setAccounts,
    getAllStreamEstimates,
    getEstimateByStreamId,
    getStreamEstimatesByReceiver,
    getIncomingBalanceForUser,
    updateCycle,
    updateBalances,
    updateSqueezeHistory,
  };
})();
