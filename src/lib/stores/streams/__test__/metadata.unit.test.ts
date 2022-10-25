import type * as radicleDrips from 'radicle-drips';
import { readable } from 'svelte/store';
import * as metadata from '../metadata';

vi.mock('$lib/stores/wallet', () => ({
  default: readable({
    network: {
      chainId: 1,
      name: 'homestead',
    },
  }),
}));

const MOCK_ACCOUNT_DATA = {
  describes: {
    userId: '875267609686611184008791658115888920329297355417',
    driver: 'address',
  },
  name: 'Test Account 1',
  description: "Babby's first test account",
  emoji: '🦀',
  timestamp: 1665569299,
  writtenByAddress: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
  assetConfigs: [
    {
      tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3', // RAD
      streams: [
        {
          id: '875267609686611184008791658115888920329297355417-0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3-1',
          initialDripsConfig: {
            raw: '26959946667150639794667015087019630704137713327499230465504634208256',
            durationSeconds: 0,
            amountPerSecond: '1653439153440',
            dripId: '1',
          },
          receiver: {
            userId: '875267609686611184008791658115888920329297355418',
            driver: 'address',
          },
          archived: false,
          name: 'Test stream 1',
          description: 'Just a test 1',
        },
        {
          id: '875267609686611184008791658115888920329297355417-0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3-2',
          initialDripsConfig: {
            raw: '53919893334301279589334030174039261377774857750039802946608244457472',
            durationSeconds: 0,
            amountPerSecond: '1653439153440',
            dripId: '2',
          },
          receiver: {
            userId: '875267609686611184008791658115888920329297355418',
            driver: 'address',
          },
          archived: false,
          name: 'Test stream 2',
          description: 'Just a test 2',
        },
      ],
    },
    {
      tokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      streams: [
        {
          id: '875267609686611184008791658115888920329297355417-0x6B175474E89094C44Da98b954EedeAC495271d0F-1',
          initialDripsConfig: {
            raw: '26959946667150639794667015087019630704137713327499230465504634208256',
            durationSeconds: 0,
            amountPerSecond: '1653439153440',
            dripId: '1',
          },
          receiver: {
            userId: '875267609686611184008791658115888920329297355418',
            driver: 'address',
          },
          archived: false,
          name: 'DAI test stream 1',
          description: 'Just a test 1',
        },
      ],
    },
  ],
};

global.fetch = vi.fn(
  async () =>
    ({
      json: async () => MOCK_ACCOUNT_DATA,
    } as Response),
);

/*
History sequence for tests, with one hour between each update:

1. The user created two streams with the RAD token.
2. The user paused one of the two RAD streams.
3. The user creates another stream that streams DAI.
4. The user unpauses the paused RAD stream.
*/
const MOCK_DRIPS_SET_EVENTS = [
  {
    userId: 875267609686611184008791658115888920329297355417n,
    assetId: 284221150502406160145256042239569169360715932835n, // RAD
    dripsReceiverSeenEvents: [
      {
        receiverUserId: 875267609686611184008791658115888920329297355418n,
        config: 26959946667150639794667015087019630704137713327499230465504634208256n,
      },
      {
        receiverUserId: 875267609686611184008791658115888920329297355418n,
        config: 53919893334301279589334030174039261377774857750039802946608244457472n,
      },
    ],
    receiversHash: '0x00',
    balance: 10000000000000000000n,
    blockTimestamp: 1665565699n,
    maxEnd: 100n,
  },
  {
    userId: 875267609686611184008791658115888920329297355417n,
    assetId: 284221150502406160145256042239569169360715932835n, // RAD
    dripsReceiverSeenEvents: [
      {
        receiverUserId: 875267609686611184008791658115888920329297355418n,
        config: 26959946667150639794667015087019630704137713327499230465504634208256n,
      },
    ],
    receiversHash: '0x01',
    balance: 10000000000000000000n - 3600n * (1653439153440n * 2n),
    blockTimestamp: 1665569299n, // 1 hour later
    maxEnd: 100n,
  },
  {
    userId: 875267609686611184008791658115888920329297355417n,
    assetId: 611382286831621467233887798921843936019654057231n, // DAI
    dripsReceiverSeenEvents: [
      {
        receiverUserId: 875267609686611184008791658115888920329297355418n,
        config: 26959946667150639794667015087019630704137713327499230465504634208256n,
      },
    ],
    receiversHash: '0x02',
    balance: 10000000000000000000n,
    blockTimestamp: 1665572899n, // 1 hour later
    maxEnd: 100n,
  },
  {
    userId: 875267609686611184008791658115888920329297355417n,
    assetId: 284221150502406160145256042239569169360715932835n, // RAD
    dripsReceiverSeenEvents: [
      {
        receiverUserId: 875267609686611184008791658115888920329297355418n,
        config: 26959946667150639794667015087019630704137713327499230465504634208256n,
      },
      {
        receiverUserId: 875267609686611184008791658115888920329297355418n,
        config: 53919893334301279589334030174039261377774857750039802946608244457472n,
      },
    ],
    receiversHash: '0x00',
    balance: 10000000000000000000n - 3600n * 3n * 1653439153440n - 3600n * 1653439153440n,
    blockTimestamp: 1665576499n, // 1 hour later
    maxEnd: 100n,
  },
];

vi.mock('radicle-drips', async () => ({
  ...((await vi.importActual('radicle-drips')) as typeof radicleDrips),
  DripsSubgraphClient: {
    create: () => ({
      getDripsSetEventsByUserId: () => MOCK_DRIPS_SET_EVENTS,
      getUserMetadataByUserId: () => ({ value: '0x666f6f' }), // 0x666f6f = Hex speak for 'foo'
    }),
  },
}));

describe('metadata.ts', () => {
  describe('fetchAccount', () => {
    it('includes expected metadata', async () => {
      const account = await metadata.fetchAccount(
        '875267609686611184008791658115888920329297355417',
      );

      expect(account.name).toBe(MOCK_ACCOUNT_DATA.name);
      expect(account.description).toBe(MOCK_ACCOUNT_DATA.description);
      expect(account.emoji).toBe(MOCK_ACCOUNT_DATA.emoji);

      expect(account.user.userId).toBe(MOCK_ACCOUNT_DATA.describes.userId);
      expect(account.user.driver).toBe(MOCK_ACCOUNT_DATA.describes.driver);
      // TODO: This is a mocked value ATM since the Drips SDK doesn't yet support converting the user ID to an address.
      expect(account.user.address).toBe('0x99505B669C6064BA2B2f26f2E4fffa5e8d906299');

      expect(account.lastUpdated?.getTime()).toBe(
        new Date(MOCK_ACCOUNT_DATA.timestamp * 1000).getTime(),
      );
      expect(account.lastUpdatedByAddress).toBe('0x99505B669C6064BA2B2f26f2E4fffa5e8d906299');

      // TODO: This is a mocked value ATM since the Drips SDK doesn't yet support fetching the metadata hash.
      expect(account.lastIpfsHash).toBe('foo');
    });

    it('creates the expected assetConfig objects', async () => {
      const account = await metadata.fetchAccount(
        '875267609686611184008791658115888920329297355417',
      );

      expect(account.assetConfigs).toHaveLength(2);

      // RAD asset config
      expect(
        account.assetConfigs.find(
          (v) => v.tokenAddress === '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
        ),
      ).toBeTruthy();

      // DAI asset config
      expect(
        account.assetConfigs.find(
          (v) => v.tokenAddress === '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        ),
      ).toBeTruthy();
    });

    it('creates the expected stream objects', async () => {
      const account = await metadata.fetchAccount(
        '875267609686611184008791658115888920329297355417',
      );

      // RAD streams
      const radAssetConfig = account.assetConfigs.find(
        (v) => v.tokenAddress === '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
      );
      const radStreams = radAssetConfig?.streams;
      expect(radStreams).toHaveLength(2);

      const radStream1 = radStreams?.find((s) => s.name === 'Test stream 1');
      expect(radStream1).toBeTruthy();
      expect(radStream1?.description).toBe('Just a test 1');

      const radStream2 = radStreams?.find((s) => s.name === 'Test stream 2');
      expect(radStream2).toBeTruthy();
      expect(radStream2?.description).toBe('Just a test 2');

      // DAI streams
      const daiAssetConfig = account.assetConfigs.find(
        (v) => v.tokenAddress === '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      );
      const daiStreams = daiAssetConfig?.streams;
      expect(daiStreams).toHaveLength(1);

      const daiStream1 = daiStreams?.find((s) => s.name === 'DAI test stream 1');
      expect(daiStream1).toBeTruthy();
      expect(daiStream1?.description).toBe('Just a test 1');
    });

    it('builds the correct assetConfig history for RAD', async () => {
      const account = await metadata.fetchAccount(
        '875267609686611184008791658115888920329297355417',
      );

      // RAD assetConfig
      const radAssetConfig = account.assetConfigs.find(
        (v) => v.tokenAddress === '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
      );
      const radHistory = radAssetConfig?.history;
      expect(radHistory).toHaveLength(3);

      const radStreams = MOCK_ACCOUNT_DATA.assetConfigs[0].streams;

      /*
      Check first RAD history item.
      According to mocked drips set events, there should be two active RAD streams.
      */
      const radHistoryItem1Streams = radHistory?.[0].streams;
      expect(radHistoryItem1Streams).toHaveLength(2);

      expect(radHistoryItem1Streams?.find((s) => s.streamId === radStreams[0].id)).toStrictEqual({
        streamId: radStreams[0].id,
        dripsConfig: {
          amountPerSecond: {
            amount: 1653439153440n,
            tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
          },
          dripId: '1',
          durationSeconds: undefined,
          raw: 26959946667150639794667015087019630704137713327499230465504634208256n,
          startDate: undefined,
        },
        receiver: {
          address: '0x99505b669c6064bA2B2F26f2E4fffa5E8D90629A',
          driver: 'address',
          userId: '875267609686611184008791658115888920329297355418',
        },
        managed: true,
      });
      expect(radHistoryItem1Streams?.find((s) => s.streamId === radStreams[1].id)).toStrictEqual({
        streamId: radStreams[1].id,
        dripsConfig: {
          amountPerSecond: {
            amount: 1653439153440n,
            tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
          },
          dripId: '2',
          durationSeconds: undefined,
          raw: 53919893334301279589334030174039261377774857750039802946608244457472n,
          startDate: undefined,
        },
        receiver: {
          address: '0x99505b669c6064bA2B2F26f2E4fffa5E8D90629A',
          driver: 'address',
          userId: '875267609686611184008791658115888920329297355418',
        },
        managed: true,
      });

      /*
      Check second RAD history item.
      According to mocked drips set events, one of the streams should be paused now.
      */

      const radHistoryItem2Streams = radHistory?.[1].streams;
      expect(radHistoryItem2Streams).toHaveLength(2);

      expect(radHistoryItem2Streams?.find((s) => s.streamId === radStreams[0].id)).toStrictEqual({
        streamId: radStreams[0].id,
        dripsConfig: {
          amountPerSecond: {
            amount: 1653439153440n,
            tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
          },
          durationSeconds: undefined,
          dripId: '1',
          raw: 26959946667150639794667015087019630704137713327499230465504634208256n,
          startDate: undefined,
        },
        receiver: {
          address: '0x99505b669c6064bA2B2F26f2E4fffa5E8D90629A',
          driver: 'address',
          userId: '875267609686611184008791658115888920329297355418',
        },
        managed: true,
      });
      expect(radHistoryItem2Streams?.find((s) => s.streamId === radStreams[1].id)).toStrictEqual({
        streamId: radStreams[1].id,
        dripsConfig: undefined,
        managed: true,
        receiver: {
          address: '0x99505b669c6064bA2B2F26f2E4fffa5E8D90629A',
          driver: 'address',
          userId: '875267609686611184008791658115888920329297355418',
        },
      });

      /*
      Check third RAD history item.
      According to mocked drips set events, the previously paused stream should be unpaused.
      */

      const radHistoryItem3Streams = radHistory?.[2].streams;
      expect(radHistoryItem3Streams).toHaveLength(2);

      expect(radHistoryItem3Streams?.find((s) => s.streamId === radStreams[0].id)).toStrictEqual({
        streamId: radStreams[0].id,
        dripsConfig: {
          amountPerSecond: {
            amount: 1653439153440n,
            tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
          },
          durationSeconds: undefined,
          dripId: '1',
          raw: 26959946667150639794667015087019630704137713327499230465504634208256n,
          startDate: undefined,
        },
        receiver: {
          address: '0x99505b669c6064bA2B2F26f2E4fffa5E8D90629A',
          driver: 'address',
          userId: '875267609686611184008791658115888920329297355418',
        },
        managed: true,
      });
      expect(radHistoryItem3Streams?.find((s) => s.streamId === radStreams[1].id)).toStrictEqual({
        streamId: radStreams[1].id,
        dripsConfig: {
          amountPerSecond: {
            amount: 1653439153440n,
            tokenAddress: '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3',
          },
          dripId: '2',
          durationSeconds: undefined,
          raw: 53919893334301279589334030174039261377774857750039802946608244457472n,
          startDate: undefined,
        },
        receiver: {
          address: '0x99505b669c6064bA2B2F26f2E4fffa5E8D90629A',
          driver: 'address',
          userId: '875267609686611184008791658115888920329297355418',
        },
        managed: true,
      });
    });

    it('builds the correct assetConfig history for DAI', async () => {
      const account = await metadata.fetchAccount(
        '875267609686611184008791658115888920329297355417',
      );

      // DAI assetConfig
      const daiAssetConfig = account.assetConfigs.find(
        (v) => v.tokenAddress === '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      );
      const daiHistory = daiAssetConfig?.history;
      expect(daiHistory).toHaveLength(1);

      const daiStreams = MOCK_ACCOUNT_DATA.assetConfigs[1].streams;

      /*
      Check first DAI history item.
      According to mocked drips set events, there should be one active DAI stream.
      */
      const daiHistoryItem1Streams = daiHistory?.[0].streams;
      expect(daiHistoryItem1Streams).toHaveLength(1);

      expect(daiHistoryItem1Streams?.find((s) => s.streamId === daiStreams[0].id)).toStrictEqual({
        streamId: daiStreams[0].id,
        dripsConfig: {
          amountPerSecond: {
            amount: 1653439153440n,
            tokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          },
          dripId: '1',
          durationSeconds: undefined,
          raw: 26959946667150639794667015087019630704137713327499230465504634208256n,
          startDate: undefined,
        },
        receiver: {
          address: '0x99505b669c6064bA2B2F26f2E4fffa5E8D90629A',
          driver: 'address',
          userId: '875267609686611184008791658115888920329297355418',
        },
        managed: true,
      });
    });
  });
});
