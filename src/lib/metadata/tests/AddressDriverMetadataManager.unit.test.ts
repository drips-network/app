import {
  DripsSubgraphClient,
  type DripsSetEvent,
  type DripsSetEventWithFullReceivers,
  AddressDriverClient,
} from 'radicle-drips';
import type { addressDriverAccountMetadataSchema } from '../schemas';
import * as getDripsClients from '$lib/utils/get-drips-clients';
import * as reconcileDripsSetReceivers from '$lib/stores/streams/methods/reconcile-drips-set-receivers';
import type { Mock } from 'vitest';
import seperateDripsSetEvents from '$lib/stores/streams/methods/separate-drips-set-events';
import AddressDriverMetadataManager from '../AddressDriverMetadataManager';
import MetadataManagerBase from '../MetadataManagerBase';
import type { z } from 'zod';
import buildAssetConfigs from '$lib/stores/streams/methods/build-asset-configs';
import type { Account } from '$lib/stores/streams/types';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';

describe('AddressDriverMetadataManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchAccount', () => {
    it('should fetch account', async () => {
      // Arrange
      const userId = '1';

      const expectedDripsSetEvents = [
        {
          dripsSetId: '1',
        },
      ] as unknown as DripsSetEvent[];

      const mockSubgraphClient = {
        getDripsSetEventsByUserId: vi
          .fn(DripsSubgraphClient.prototype.getDripsSetEventsByUserId)
          .mockResolvedValue(expectedDripsSetEvents),
      } as unknown as DripsSubgraphClient;

      vi.spyOn(getDripsClients, 'getSubgraphClient').mockReturnValue(mockSubgraphClient);

      const expectedDripsSetEventsWithFullReceivers = [
        {
          dripsSetId: '1',
        },
      ] as unknown as DripsSetEventWithFullReceivers[];

      const reconcileDripsSetReceiversMock = vi
        .fn()
        .mockReturnValue(expectedDripsSetEventsWithFullReceivers);

      vi.spyOn(reconcileDripsSetReceivers, 'reconcileDripsSetReceivers').mockImplementation(
        reconcileDripsSetReceiversMock,
      );

      const seperateDripsSetEventsMock = vi
        .fn()
        .mockReturnValue(expectedDripsSetEventsWithFullReceivers);

      vi.mock('$lib/stores/streams/methods/separate-drips-set-events', () => ({
        default: vi.fn(),
      }));

      (seperateDripsSetEvents as Mock).mockImplementation(seperateDripsSetEventsMock);

      const expectedMetadata = {
        data: {
          name: 'John Doe',
          description: 'An account description',
          emoji: '🚀',
          timestamp: 1234567890,
          writtenByAddress: '0x123',
        },
        hash: 'QmX',
      } as unknown as { hash: string; data: z.infer<typeof addressDriverAccountMetadataSchema> };

      MetadataManagerBase.prototype.fetchAccountMetadata = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue(expectedMetadata);

      vi.mock('$lib/stores/streams/methods/build-asset-configs', () => ({
        default: vi.fn(),
      }));

      const expectedAssetConfigs = [
        {
          dripsSetId: '1',
        },
      ];

      const buildAssetConfigsMock = vi.fn().mockReturnValue(expectedAssetConfigs);

      (buildAssetConfigs as Mock).mockImplementation(buildAssetConfigsMock);

      AddressDriverClient.getUserAddress = vi
        .fn(AddressDriverClient.getUserAddress)
        .mockReturnValue('0x123');

      // Act
      const account = await new AddressDriverMetadataManager().fetchAccount(userId);

      // Assert
      expect(account).toEqual({
        user: {
          userId,
          driver: 'address',
          address: AddressDriverClient.getUserAddress(userId),
        },
        name: expectedMetadata.data.name,
        description: expectedMetadata.data.description,
        emoji: expectedMetadata.data.emoji,
        assetConfigs: expectedAssetConfigs,
        lastUpdated: new Date(expectedMetadata.data.timestamp * 1000),
        lastUpdatedByAddress: expectedMetadata.data.writtenByAddress,
        lastIpfsHash: expectedMetadata.hash,
      });

      expect(mockSubgraphClient.getDripsSetEventsByUserId).toHaveBeenCalledWith(userId);
      expect(reconcileDripsSetReceiversMock).toHaveBeenCalledWith(expectedDripsSetEvents);
      expect(seperateDripsSetEventsMock).toHaveBeenCalledWith(
        expectedDripsSetEventsWithFullReceivers,
      );
      expect(buildAssetConfigsMock).toHaveBeenCalledWith(
        userId,
        expectedMetadata.data,
        expectedDripsSetEventsWithFullReceivers,
      );
    });
  });

  describe('generateAccountMetadata', () => {
    it('should generate account metadata', () => {
      // Arrange
      const forAccount: Account = {
        user: {
          userId: '1',
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
                dripsConfig: {
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
                  userId: '2',
                  driver: 'address',
                  address: '0x789',
                },
                archived: false,
                name: 'Stream 1',
                description: 'A test stream',
              },
            ],
          } as any,
        ],
        lastUpdated: new Date(),
        lastUpdatedByAddress: '0x123',
        lastIpfsHash: 'QmX',
      };
      const address = '0x123';

      // Act
      const accountMetadata = new AddressDriverMetadataManager().generateAccountMetadata(
        forAccount,
        address,
      );

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
                dripId: stream.dripsConfig.dripId,
                raw: stream.dripsConfig.raw.toString(),
                startTimestamp: Math.floor((stream.dripsConfig.startDate?.getTime() || 0) / 1000),
                durationSeconds: stream.dripsConfig.durationSeconds || 0,
                amountPerSecond: stream.dripsConfig.amountPerSecond.amount,
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
