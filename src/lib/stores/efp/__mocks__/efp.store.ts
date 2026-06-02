import { writable } from 'svelte/store';
import type { EfpCommonFollower, EfpStats } from '$lib/utils/efp';

export const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';
export const TEST_VIEWER = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

const mockStats: EfpStats = {
  followers: 42,
  following: 7,
};

const mockCommonFollowers: EfpCommonFollower[] = [
  {
    address: '0x2222222222222222222222222222222222222222',
    name: 'alice.eth',
  },
];

function commonFollowersKey(target: string, leader: string) {
  return `${target.toLowerCase()}:${leader.toLowerCase()}`;
}

export default (() => {
  const statsState = writable<Record<string, { stats?: EfpStats }>>({});
  const commonFollowersState = writable<Record<string, EfpCommonFollower[]>>({});

  function hydrateStats(address: string, stats: EfpStats) {
    statsState.update((s) => ({ ...s, [address.toLowerCase()]: { stats } }));
  }

  async function lookupStats(address: string) {
    if (address.toLowerCase() === TEST_ADDRESS) {
      statsState.set({ [TEST_ADDRESS]: { stats: mockStats } });
      return mockStats;
    }
    return undefined;
  }

  async function lookupCommonFollowers(viewedAddress: string, leaderAddress: string) {
    if (
      viewedAddress.toLowerCase() === TEST_ADDRESS &&
      leaderAddress.toLowerCase() === TEST_VIEWER
    ) {
      const key = commonFollowersKey(viewedAddress, leaderAddress);
      commonFollowersState.set({ [key]: mockCommonFollowers });
      return mockCommonFollowers;
    }
    return undefined;
  }

  return {
    subscribe: statsState.subscribe,
    subscribeCommonFollowers: commonFollowersState.subscribe,
    lookupStats,
    hydrateStats,
    lookupCommonFollowers,
    getStats: (address: string) =>
      address.toLowerCase() === TEST_ADDRESS ? mockStats : undefined,
    getCommonFollowersFor: (viewed: string, leader: string) => {
      const key = commonFollowersKey(viewed, leader);
      let value: EfpCommonFollower[] | undefined;
      commonFollowersState.subscribe((s) => {
        value = s[key];
      })();
      return value;
    },
    clear: () => {
      statsState.set({});
      commonFollowersState.set({});
    },
  };
})();
