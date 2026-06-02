import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import {
  getCommonFollowers,
  getEfpStats,
  type EfpCommonFollower,
  type EfpStats,
} from '$lib/utils/efp';
import network from '../wallet/network';

export type EfpAddressRecord = {
  stats?: EfpStats;
};

type StatsState = {
  [address: string]: EfpAddressRecord | undefined;
};

type CommonFollowersState = {
  [key: string]: EfpCommonFollower[] | undefined;
};

export function commonFollowersKey(target: string, leader: string) {
  return `${target.toLowerCase()}:${leader.toLowerCase()}`;
}

export default (() => {
  const statsState = writable<StatsState>({});
  const commonFollowersState = writable<CommonFollowersState>({});
  const inFlightStats = new Set<string>();
  const inFlightCommon = new Set<string>();

  async function lookupStats(address: string): Promise<EfpStats | undefined> {
    if (!browser || !network.enableEfp) return undefined;

    const key = address.toLowerCase();
    const saved = get(statsState)[key];
    if (saved?.stats) return saved.stats;
    if (inFlightStats.has(key)) return undefined;

    inFlightStats.add(key);
    statsState.update((s) => ({ ...s, [key]: {} }));

    try {
      const stats = await getEfpStats(address);
      if (stats) {
        statsState.update((s) => ({ ...s, [key]: { stats } }));
        return stats;
      }
    } finally {
      inFlightStats.delete(key);
    }

    return undefined;
  }

  async function lookupCommonFollowers(
    targetAddress: string,
    leaderAddress: string,
    limit = 5,
  ): Promise<EfpCommonFollower[] | undefined> {
    if (!browser || !network.enableEfp) return undefined;

    const key = commonFollowersKey(targetAddress, leaderAddress);
    const saved = get(commonFollowersState)[key];
    if (saved) return saved;
    if (inFlightCommon.has(key)) return undefined;

    inFlightCommon.add(key);

    try {
      const results = await getCommonFollowers(targetAddress, leaderAddress, fetch, limit);
      if (results) {
        commonFollowersState.update((s) => ({ ...s, [key]: results }));
        return results;
      }
    } finally {
      inFlightCommon.delete(key);
    }

    return undefined;
  }

  function hydrateStats(address: string, stats: EfpStats) {
    if (!browser || !network.enableEfp) return;

    const key = address.toLowerCase();
    statsState.update((s) => ({ ...s, [key]: { stats } }));
  }

  function getStats(address: string): EfpStats | undefined {
    return get(statsState)[address.toLowerCase()]?.stats;
  }

  function getCommonFollowersFor(
    targetAddress: string,
    leaderAddress: string,
  ): EfpCommonFollower[] | undefined {
    return get(commonFollowersState)[commonFollowersKey(targetAddress, leaderAddress)];
  }

  function clear() {
    statsState.set({});
    commonFollowersState.set({});
    inFlightStats.clear();
    inFlightCommon.clear();
  }

  return {
    subscribe: statsState.subscribe,
    subscribeCommonFollowers: commonFollowersState.subscribe,
    lookupStats,
    hydrateStats,
    lookupCommonFollowers,
    getStats,
    getCommonFollowersFor,
    clear,
  };
})();
