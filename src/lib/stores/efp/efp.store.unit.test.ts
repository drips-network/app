import { get } from 'svelte/store';
import efpStore from '.';
import * as efpApi from '$lib/utils/efp';

vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
}));

vi.mock('$lib/stores/wallet/network', () => ({
  default: { enableEfp: true },
}));

vi.mock('$lib/utils/efp', () => ({
  getEfpStats: vi.fn(),
  getCommonFollowers: vi.fn(),
}));

const getEfpStats = vi.mocked(efpApi.getEfpStats);
const getCommonFollowers = vi.mocked(efpApi.getCommonFollowers);

afterEach(() => {
  efpStore.clear();
  vi.clearAllMocks();
});

describe('efp store', () => {
  it('normalizes address keys to lowercase', async () => {
    getEfpStats.mockResolvedValue({ followers: 10, following: 2 });

    await efpStore.lookupStats('0xAbCdEf0123456789012345678901234567890AbCdEf');

    expect(get(efpStore)['0xabcdef0123456789012345678901234567890abcdef']?.stats).toEqual({
      followers: 10,
      following: 2,
    });
  });

  it('deduplicates in-flight stats lookups', async () => {
    getEfpStats.mockResolvedValue({ followers: 1, following: 1 });

    const address = '0x1111111111111111111111111111111111111111';
    void efpStore.lookupStats(address);
    void efpStore.lookupStats(address);
    await efpStore.lookupStats(address);

    expect(getEfpStats).toHaveBeenCalledTimes(1);
  });

  it('returns undefined without throwing when lookup fails', async () => {
    getEfpStats.mockResolvedValue(null);

    const result = await efpStore.lookupStats('0x2222222222222222222222222222222222222222');

    expect(result).toBeUndefined();
    expect(get(efpStore)['0x2222222222222222222222222222222222222222']).toEqual({});
  });

  it('clears cached state', async () => {
    getEfpStats.mockResolvedValue({ followers: 5, following: 1 });
    await efpStore.lookupStats('0x3333333333333333333333333333333333333333');

    efpStore.clear();

    expect(get(efpStore)).toEqual({});
  });

  it('caches common followers by target and leader', async () => {
    getCommonFollowers.mockResolvedValue([
      { address: '0x4444444444444444444444444444444444444444' },
    ]);

    const target = '0x5555555555555555555555555555555555555555';
    const leader = '0x6666666666666666666666666666666666666666';

    await efpStore.lookupCommonFollowers(target, leader);

    expect(getCommonFollowers).toHaveBeenCalledWith(target, leader, expect.any(Function), 5);
    expect(efpStore.getCommonFollowersFor(target, leader)).toEqual([
      { address: '0x4444444444444444444444444444444444444444' },
    ]);
  });
});
