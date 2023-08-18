import {
  DripsSubgraphClient,
  type StreamsSetEvent,
  type StreamsSetEventWithFullReceivers,
  AddressDriverClient,
} from 'radicle-drips';
import * as getDripsClients from '$lib/utils/get-drips-clients';
import * as reconcileStreamsSetReceivers from '$lib/stores/streams/methods/reconcile-drips-set-receivers';
import type { Mock } from 'vitest';
import seperateStreamsSetEvents from '$lib/stores/streams/methods/separate-drips-set-events';
import AddressDriverMetadataManager from '../AddressDriverMetadataManager';
import MetadataManagerBase from '../MetadataManagerBase';
import buildAssetConfigs from '$lib/stores/streams/methods/build-asset-configs';
import type { Account } from '$lib/stores/streams/types';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type { LatestVersion } from '../versioned-metadata';
import type { addressDriverAccountMetadataParser } from '../schemas';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

describe('AddressDriverMetadataManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchAccount', () => {
    it('should fetch account', async () => {
      // Arrange
      const accountId = '1';

      const expectedStreamsSetEvents = [
        {
          streamsSetId: '1',
        },
      ] as unknown as StreamsSetEvent[];

      const mockSubgraphClient = {
        getStreamsSetEventsByAccountId: vi
          .fn(DripsSubgraphClient.prototype.getStreamsSetEventsByAccountId)
          .mockResolvedValue(expectedStreamsSetEvents),
      } as unknown as DripsSubgraphClient;

      vi.spyOn(getDripsClients, 'getSubgraphClient').mockReturnValue(mockSubgraphClient);

      const expectedStreamsSetEventsWithFullReceivers = [
        {
          streamsSetId: '1',
        },
      ] as unknown as StreamsSetEventWithFullReceivers[];

      const reconcileStreamsSetReceiversMock = vi
        .fn()
        .mockReturnValue(expectedStreamsSetEventsWithFullReceivers);

      vi.spyOn(reconcileStreamsSetReceivers, 'reconcileStreamsSetReceivers').mockImplementation(
        reconcileStreamsSetReceiversMock,
      );

      const seperateStreamsSetEventsMock = vi
        .fn()
        .mockReturnValue(expectedStreamsSetEventsWithFullReceivers);

      vi.mock('$lib/stores/streams/methods/separate-drips-set-events', () => ({
        default: vi.fn(),
      }));

      (seperateStreamsSetEvents as Mock).mockImplementation(seperateStreamsSetEventsMock);

      const expectedMetadata = {
        data: {
          name: 'John Doe',
          description: 'An account description',
          emoji: '🚀',
          timestamp: 1234567890,
          writtenByAddress: '0x123',
        },
        hash: 'QmX',
      } as unknown as {
        hash: string;
        data: LatestVersion<typeof addressDriverAccountMetadataParser>;
      };

      MetadataManagerBase.prototype.fetchAccountMetadata = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue(expectedMetadata);

      vi.mock('$lib/stores/streams/methods/build-asset-configs', () => ({
        default: vi.fn(),
      }));

      const expectedAssetConfigs = [
        {
          streamsSetId: '1',
        },
      ];

      const buildAssetConfigsMock = vi.fn().mockReturnValue(expectedAssetConfigs);

      (buildAssetConfigs as Mock).mockImplementation(buildAssetConfigsMock);

      AddressDriverClient.getUserAddress = vi
        .fn(AddressDriverClient.getUserAddress)
        .mockReturnValue('0x123');

      // Act
      const account = await new AddressDriverMetadataManager().fetchAccount(accountId);

      // Assert
      expect(account).toEqual({
        user: {
          accountId,
          driver: 'address',
          address: AddressDriverClient.getUserAddress(accountId),
        },
        name: expectedMetadata.data.name,
        description: expectedMetadata.data.description,
        emoji: expectedMetadata.data.emoji,
        assetConfigs: expectedAssetConfigs,
        lastUpdated: new Date(expectedMetadata.data.timestamp * 1000),
        lastUpdatedByAddress: expectedMetadata.data.writtenByAddress,
        lastIpfsHash: expectedMetadata.hash,
      });

      expect(mockSubgraphClient.getStreamsSetEventsByAccountId).toHaveBeenCalledWith(accountId);
      expect(reconcileStreamsSetReceiversMock).toHaveBeenCalledWith(expectedStreamsSetEvents);
      expect(seperateStreamsSetEventsMock).toHaveBeenCalledWith(
        expectedStreamsSetEventsWithFullReceivers,
      );
      expect(buildAssetConfigsMock).toHaveBeenCalledWith(
        accountId,
        expectedMetadata.data,
        expectedStreamsSetEventsWithFullReceivers,
      );
    });
  });

  describe('generateAccountMetadata', () => {
    it('should generate account metadata', () => {
      // Arrange
      const forAccount: Account = {
        user: {
          accountId: '1',
          driver: 'address',
          address: '0x123',
        },
        name: 'John Doe',
        description: 'An account description',
        emoji: '🚀',
        assetConfigs: [
          {
            tokenAddress: '0x456',
            streams: [
              {
                id: '1',
                streamConfig: {
                  dripId: '2',
                  raw: BigInt(1000),
                  startDate: new Date(),
                  durationSeconds: 3600,
                  amountPerSecond: {
                    amount: 10n,
                    tokenAddress: '0x456',
                  },
                },
                managed: true,
                receiver: {
                  accountId: '2',
                  driver: 'address',
                  address: '0x789',
                },
                archived: false,
                name: 'Stream 1',
                description: 'A test stream',
              },
            ],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        ],
        lastUpdated: new Date(),
        lastUpdatedByAddress: '0x123',
        lastIpfsHash: 'QmX',
      };
      const address = '0x123';

      // Act
      const accountMetadata = new AddressDriverMetadataManager().buildAccountMetadata({
        forAccount,
        address,
      });

      // Assert
      expect(accountMetadata.describes).toEqual(forAccount.user);
      expect(accountMetadata.name).toEqual(forAccount.name);
      expect(accountMetadata.description).toEqual(forAccount.description);
      expect(accountMetadata.emoji).toEqual(forAccount.emoji);
      expect(accountMetadata.timestamp).toBeGreaterThanOrEqual(
        Math.floor(new Date().getTime() / 1000),
      );
      expect(accountMetadata.writtenByAddress).toEqual(address);
      expect(accountMetadata.assetConfigs).toEqual(
        mapFilterUndefined(forAccount.assetConfigs, (assetConfig) => ({
          tokenAddress: assetConfig.tokenAddress,
          streams: mapFilterUndefined(assetConfig.streams, (stream) => {
            if (stream.managed === false) return undefined;

            return {
              id: stream.id,
              initialDripsConfig: {
                dripId: stream.streamConfig.dripId,
                raw: stream.streamConfig.raw.toString(),
                startTimestamp: Math.floor((stream.streamConfig.startDate?.getTime() || 0) / 1000),
                durationSeconds: stream.streamConfig.durationSeconds || 0,
                amountPerSecond: stream.streamConfig.amountPerSecond.amount,
              },
              receiver: stream.receiver,
              archived: stream.archived ?? false,
              name: stream.name,
              description: stream.description,
            };
          }),
        })),
      );
    });
  });
});
