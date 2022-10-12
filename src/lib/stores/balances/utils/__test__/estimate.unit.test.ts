import { Utils } from 'radicle-drips';
import { estimateAssetConfig } from '../estimate';

const MOCK_USER = {
  driver: 'address',
  userId: 'foobar',
  address: '0x00',
} as {
  driver: 'address';
  userId: string;
  address: string;
};

const mockStream = ({
  id,
  paused,
  amountPerSecond,
  durationSeconds,
  startTimestamp,
}: {
  id: string;
  paused: boolean;
  amountPerSecond: bigint;
  durationSeconds: number;
  startTimestamp: number;
}) => ({
  id,
  sender: MOCK_USER,
  receiver: MOCK_USER,
  dripsConfig: {
    raw: Utils.DripsReceiverConfiguration.toUint256({
      amountPerSec: amountPerSecond,
      start: BigInt(startTimestamp),
      duration: BigInt(durationSeconds),
    }),
    amountPerSecond: {
      tokenAddress: '0x00',
      amount: amountPerSecond,
    },
    startDate: startTimestamp === 0 ? undefined : new Date(startTimestamp * 1000),
    durationSeconds: durationSeconds === 0 ? undefined : durationSeconds,
  },
  paused,
  managed: true,
});

const mockAssetConfigHistoryItem = ({
  timestamp,
  runsOutOfFundsTimestamp,
  streams,
  balance,
}: {
  timestamp: number;
  runsOutOfFundsTimestamp: number;
  balance: bigint;
  streams: ReturnType<typeof mockStream>[];
}) => ({
  timestamp: new Date(timestamp * 1000),
  balance: {
    tokenAddress: '0x00',
    amount: balance,
  },
  streams: streams.map((stream) => ({
    streamId: stream.id,
    dripsConfig: stream.paused ? undefined : stream.dripsConfig,
    managed: stream.managed,
  })),
  runsOutOfFunds: new Date(runsOutOfFundsTimestamp * 1000),
});

const mockAssetConfig = (
  streams: ReturnType<typeof mockStream>[],
  history: ReturnType<typeof mockAssetConfigHistoryItem>[],
) => ({
  tokenAddress: '0x00',
  streams,
  history,
});

afterEach(() => {
  vi.useRealTimers();
});

describe('estimate.ts', () => {
  describe('estimateAssetConfig', () => {
    it('correctly calculates a simple stream', () => {
      vi.useFakeTimers();
      vi.setSystemTime(10 * 1000);

      const activeMockStream = mockStream({
        id: 'foo',
        paused: false,
        amountPerSecond: 100n,
        durationSeconds: 0,
        startTimestamp: 0,
      });

      const result = estimateAssetConfig(
        mockAssetConfig(
          [activeMockStream],
          [
            mockAssetConfigHistoryItem({
              timestamp: 0,
              streams: [activeMockStream],
              balance: 10000n,
              runsOutOfFundsTimestamp: 100,
            }),
          ],
        ),
      );

      expect(result.totals.amountPerSecond.amount).toBe(100n);
      expect(result.totals.totalStreamed.amount).toBe(1000n);
      expect(result.totals.remainingBalance.amount).toBe(9000n);

      expect(result.streams['foo'].totalStreamed.amount).toBe(1000n);
    });

    it('handles a stream being paused and unpaused', () => {
      vi.useFakeTimers();
      vi.setSystemTime(10 * 1000);

      const activeMockStream = mockStream({
        id: 'foo',
        paused: false,
        amountPerSecond: 100n,
        durationSeconds: 0,
        startTimestamp: 0,
      });

      const pausedMockStream = {
        ...activeMockStream,
        paused: true,
      };

      const result = estimateAssetConfig(
        mockAssetConfig(
          [activeMockStream],
          [
            mockAssetConfigHistoryItem({
              timestamp: 0,
              streams: [activeMockStream],
              balance: 10000n,
              runsOutOfFundsTimestamp: 100,
            }),
            mockAssetConfigHistoryItem({
              timestamp: 5,
              streams: [pausedMockStream],
              balance: 9500n,
              runsOutOfFundsTimestamp: 100,
            }),
          ],
        ),
      );

      expect(result.totals.amountPerSecond.amount).toBe(0n);
      expect(result.totals.totalStreamed.amount).toBe(500n);
      expect(result.totals.remainingBalance.amount).toBe(9500n);

      expect(result.streams['foo'].totalStreamed.amount).toBe(500n);
    });

    it('handles streams running out of funds', () => {
      vi.useFakeTimers();
      vi.setSystemTime(10 * 1000);

      const activeMockStream = mockStream({
        id: 'foo',
        paused: false,
        amountPerSecond: 50n,
        durationSeconds: 0,
        startTimestamp: 0,
      });

      const result = estimateAssetConfig(
        mockAssetConfig(
          [activeMockStream],
          [
            mockAssetConfigHistoryItem({
              timestamp: 0,
              streams: [activeMockStream],
              balance: 250n,
              runsOutOfFundsTimestamp: 5,
            }),
          ],
        ),
      );

      expect(result.totals.amountPerSecond.amount).toBe(0n);
      expect(result.totals.totalStreamed.amount).toBe(250n);
      expect(result.totals.remainingBalance.amount).toBe(0n);

      expect(result.streams['foo'].totalStreamed.amount).toBe(250n);
    });
  });
});
