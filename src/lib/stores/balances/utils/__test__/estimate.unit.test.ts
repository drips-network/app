import { Utils } from 'radicle-drips';
import { estimateAssetConfig } from '../estimate';

const MOCK_USER = {
  driver: 'address',
  userId: '1234',
  address: '0x00',
} as {
  driver: 'address';
  userId: string;
  address: string;
};

const mockStream = ({
  dripId,
  paused,
  amountPerSecond,
  durationSeconds,
  startTimestamp,
}: {
  dripId: number;
  paused: boolean;
  amountPerSecond: bigint;
  durationSeconds: number;
  startTimestamp: number;
}) => ({
  id: `${MOCK_USER.userId}-0x00-${dripId}`,
  sender: MOCK_USER,
  receiver: MOCK_USER,
  dripsConfig: {
    raw: Utils.StreamConfiguration.toUint256({
      amountPerSec: amountPerSecond,
      start: BigInt(startTimestamp),
      duration: BigInt(durationSeconds),
      dripId: BigInt(dripId),
    }),
    amountPerSecond: {
      tokenAddress: '0x00',
      amount: amountPerSecond,
    },
    dripId: String(dripId),
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
  runsOutOfFundsTimestamp?: number;
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
    receiver: stream.receiver,
  })),
  runsOutOfFunds: runsOutOfFundsTimestamp ? new Date(runsOutOfFundsTimestamp * 1000) : undefined,
  historyHash: '0x00',
  receiversHash: '0x00',
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

const TEST_WINDOW = {
  from: 0,
  to: 100000,
};

describe('estimate.ts', () => {
  describe('estimateAssetConfig', () => {
    it('correctly calculates a simple stream', () => {
      vi.useFakeTimers();
      vi.setSystemTime(10 * 1000);

      const activeMockStream = mockStream({
        dripId: 1,
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
        TEST_WINDOW,
        MOCK_USER,
      );

      expect(result.totals.totalAmountPerSecond).toBe(100n);
      expect(result.totals.totalStreamed).toBe(1000n);
      expect(result.totals.remainingBalance).toBe(9000n);

      expect(result.streams.find((s) => s.id === `${MOCK_USER.userId}-0x00-1`)?.totalStreamed).toBe(
        1000n,
      );
    });

    it('handles a stream being paused and unpaused', () => {
      vi.useFakeTimers();
      vi.setSystemTime(10 * 1000);

      const activeMockStream = mockStream({
        dripId: 1,
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
        TEST_WINDOW,
        MOCK_USER,
      );

      expect(result.totals.totalAmountPerSecond).toBe(0n);
      expect(result.totals.totalStreamed).toBe(500n);
      expect(result.totals.remainingBalance).toBe(9500n);

      expect(result.streams.find((s) => s.id === `${MOCK_USER.userId}-0x00-1`)?.totalStreamed).toBe(
        500n,
      );
    });

    it('handles streams running out of funds', () => {
      vi.useFakeTimers();
      vi.setSystemTime(10 * 1000);

      const activeMockStream = mockStream({
        dripId: 1,
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
        TEST_WINDOW,
        MOCK_USER,
      );

      expect(result.totals.totalAmountPerSecond).toBe(0n);
      expect(result.totals.totalStreamed).toBe(250n);
      expect(result.totals.remainingBalance).toBe(0n);

      expect(result.streams.find((s) => s.id === `${MOCK_USER.userId}-0x00-1`)?.totalStreamed).toBe(
        250n,
      );
    });

    it('handles start dates', () => {
      vi.useFakeTimers();
      vi.setSystemTime(10 * 1000);

      const streamWithStartDate = mockStream({
        dripId: 1,
        paused: false,
        amountPerSecond: 100n,
        durationSeconds: 0,
        startTimestamp: 5,
      });

      const result = estimateAssetConfig(
        mockAssetConfig(
          [streamWithStartDate],
          [
            mockAssetConfigHistoryItem({
              timestamp: 0,
              streams: [streamWithStartDate],
              balance: 1000n,
              runsOutOfFundsTimestamp: 15,
            }),
          ],
        ),
        TEST_WINDOW,
        MOCK_USER,
      );

      expect(result.totals.totalAmountPerSecond).toBe(100n);
      expect(result.totals.totalStreamed).toBe(500n);
      expect(result.totals.remainingBalance).toBe(500n);

      expect(result.streams.find((s) => s.id === `${MOCK_USER.userId}-0x00-1`)?.totalStreamed).toBe(
        500n,
      );
    });

    it('handles durations', () => {
      vi.useFakeTimers();
      vi.setSystemTime(20 * 1000);

      const streamWithDurationAndStartDate = mockStream({
        dripId: 1,
        paused: false,
        amountPerSecond: 100n,
        durationSeconds: 5,
        startTimestamp: 5,
      });

      const result = estimateAssetConfig(
        mockAssetConfig(
          [streamWithDurationAndStartDate],
          [
            mockAssetConfigHistoryItem({
              timestamp: 0,
              streams: [streamWithDurationAndStartDate],
              balance: 1000n,
              runsOutOfFundsTimestamp: 0,
            }),
          ],
        ),
        TEST_WINDOW,
        MOCK_USER,
      );

      expect(result.totals.totalAmountPerSecond).toBe(0n);
      expect(result.totals.totalStreamed).toBe(500n);
      expect(result.totals.remainingBalance).toBe(500n);

      expect(result.streams.find((s) => s.id === `${MOCK_USER.userId}-0x00-1`)?.totalStreamed).toBe(
        500n,
      );
    });
  });

  it('respects the time window argument', () => {
    vi.useFakeTimers();
    vi.setSystemTime(10 * 1000);

    const activeMockStream = mockStream({
      dripId: 1,
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
      {
        from: 0,
        to: 5 * 1000,
      },
      MOCK_USER,
    );

    expect(result.totals.totalAmountPerSecond).toBe(0n);
    expect(result.totals.totalStreamed).toBe(500n);
    expect(result.totals.remainingBalance).toBe(9500n);

    expect(result.streams.find((s) => s.id === `${MOCK_USER.userId}-0x00-1`)?.totalStreamed).toBe(
      500n,
    );
  });
});
