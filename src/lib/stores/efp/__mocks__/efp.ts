import { vi } from 'vitest';
import type { EfpCommonFollower, EfpStats } from '$lib/utils/efp';

const stats: Record<string, EfpStats> = {
  '0x1234567890123456789012345678901234567890': { followers: 42, following: 7 },
};

const commonFollowers: Record<string, EfpCommonFollower[]> = {};

const defaultExport = {
  subscribe: vi.fn((run: (value: Record<string, { stats?: EfpStats }>) => void) => {
    run(
      Object.fromEntries(
        Object.entries(stats).map(([address, s]) => [address, { stats: s }]),
      ),
    );
    return () => undefined;
  }),
  subscribeCommonFollowers: vi.fn((run: (value: Record<string, EfpCommonFollower[]>) => void) => {
    run(commonFollowers);
    return () => undefined;
  }),
  lookupStats: vi.fn(async (address: string) => stats[address.toLowerCase()]),
  lookupCommonFollowers: vi.fn(async () => []),
  clear: vi.fn(),
};

export default defaultExport;
