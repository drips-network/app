import { describe, expect, it, vi } from 'vitest';
import { getEfpStats, getFollowerState, getCommonFollowers } from './index';

describe('efp api client', () => {
  it('parses stats counts from string fields', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ followers_count: '104', following_count: '26' }),
    });

    const stats = await getEfpStats('0xabc', fetchFn);

    expect(stats).toEqual({ followers: 104, following: 26 });
  });

  it('returns null when stats request fails', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false });

    expect(await getEfpStats('0xabc', fetchFn)).toBeNull();
  });

  it('parses follower state', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        state: { follow: true, block: false, mute: false },
      }),
    });

    const state = await getFollowerState('0xuser', '0xfollower', fetchFn);

    expect(state).toEqual({ follow: true, block: false, mute: false });
  });

  it('parses common followers', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            address: '0x1',
            name: 'alice.eth',
            mutuals_rank: '3',
          },
        ],
      }),
    });

    const results = await getCommonFollowers('0xtarget', '0xleader', fetchFn);

    expect(results).toEqual([
      { address: '0x1', name: 'alice.eth', avatar: undefined, mutualsRank: 3 },
    ]);
  });
});
