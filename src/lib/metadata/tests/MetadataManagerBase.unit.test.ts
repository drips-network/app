import * as getDripsClients from '$lib/utils/get-drips-clients';
import { z } from 'zod';
import * as fetchIpfs from '$lib/utils/ipfs';
import isTest from '$lib/utils/is-test';
import type { Mock } from 'vitest';
import {
  AddressDriverClient,
  DripsSubgraphClient,
  GitDriverClient,
  NFTDriverClient,
} from 'radicle-drips';
import MetadataManagerBase from '../MetadataManagerBase';
import {
  addressDriverAccountMetadataSchema,
  gitDriverAccountMetadataSchema,
  nftDriverAccountMetadataSchema,
} from '../schemas';
import type { ContractTransaction } from 'ethers';

class TestMetadataManager<
  TAccountMetadataSchema extends z.ZodType,
> extends MetadataManagerBase<TAccountMetadataSchema> {
  constructor(metadataSchema: TAccountMetadataSchema, subgraphClient?: DripsSubgraphClient) {
    super(metadataSchema, subgraphClient ?? getDripsClients.getSubgraphClient());
  }
}

describe('MetadataManagerBase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchMetadataHashByUserId', () => {
    it('should fetch metadata hash', async () => {
      // Arrange
      const userId = '1';
      const expectedMetadata = {
        id: '1',
        key: MetadataManagerBase.USER_METADATA_KEY,
        value: 'QmX',
        userId: '1',
        lastUpdatedBlockTimestamp: 1n,
      };

      const subgraphClientMock = {
        getLatestUserMetadata: vi
          .fn(DripsSubgraphClient.prototype.getLatestUserMetadata)
          .mockResolvedValue(expectedMetadata),
      } as unknown as DripsSubgraphClient;

      const testMetadataManager = new TestMetadataManager(
        addressDriverAccountMetadataSchema,
        subgraphClientMock,
      );

      // Act
      const metadataHash = await testMetadataManager.fetchMetadataHashByUserId(userId);

      // Assert
      expect(metadataHash).toEqual(expectedMetadata.value);
      expect(subgraphClientMock.getLatestUserMetadata).toHaveBeenCalledWith(
        userId,
        MetadataManagerBase.USER_METADATA_KEY,
      );
    });
  });

  describe('fetchAccountMetadata', () => {
    it('should return the mocked metadata from localStorage when running in test mode', async () => {
      // Arrange
      const userId = '1';
      const metadataHash = 'QmX';

      const fetchMetadataHashByUserIdMock = vi
        .fn(MetadataManagerBase.prototype.fetchMetadataHashByUserId)
        .mockResolvedValue(metadataHash);
      MetadataManagerBase.prototype.fetchMetadataHashByUserId = fetchMetadataHashByUserIdMock;

      const isTestMock = vi.fn(isTest).mockReturnValue(true);
      vi.mock('$lib/utils/is-test', () => ({
        default: vi.fn(),
      }));
      (isTest as Mock).mockImplementation(isTestMock);

      const expectedMetadata = {
        name: 'John Doe',
        description: 'An account description',
        emoji: '🚀',
      };

      localStorage.setItem(`mock_ipfs_${metadataHash}`, JSON.stringify(expectedMetadata));

      // Act
      const result = await new TestMetadataManager(
        addressDriverAccountMetadataSchema,
      ).fetchAccountMetadata(userId);

      // Assert
      expect(result).toEqual(expectedMetadata);
      expect(fetchMetadataHashByUserIdMock).toHaveBeenCalledWith(userId);
    });

    it('should return metadata when metadata hash is found and IPFS fetch is successful', async () => {
      // Arrange
      const userId = '1';
      const metadataHash = 'QmX';
      const metadataSchema = z.string();
      const expectedMetadata = 'Sample metadata';

      const fetchMetadataHashByUserIdMock = vi
        .fn(MetadataManagerBase.prototype.fetchMetadataHashByUserId)
        .mockResolvedValue(metadataHash);
      MetadataManagerBase.prototype.fetchMetadataHashByUserId = fetchMetadataHashByUserIdMock;

      const fetchIpfsMock = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(expectedMetadata)));
      vi.spyOn(fetchIpfs, 'fetchIpfs').mockImplementation(fetchIpfsMock);

      // Act
      const result = await new TestMetadataManager(metadataSchema).fetchAccountMetadata(userId);

      // Assert
      expect(result).toEqual({ hash: metadataHash, data: expectedMetadata });
      expect(fetchMetadataHashByUserIdMock).toHaveBeenCalledWith(userId);
      expect(fetchIpfsMock).toHaveBeenCalledWith(metadataHash);
    });

    it('should return undefined when metadata hash is not found', async () => {
      // Arrange
      const userId = '1';
      const metadataSchema = z.string();

      // Act
      const result = await new TestMetadataManager(metadataSchema).fetchAccountMetadata(userId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return undefined when fetchIpfs throws an error', async () => {
      // Arrange
      const userId = '1';
      const metadataHash = 'QmX';
      const metadataSchema = z.string();

      const fetchMetadataHashByUserIdMock = vi
        .fn(MetadataManagerBase.prototype.fetchMetadataHashByUserId)
        .mockResolvedValue(metadataHash);
      MetadataManagerBase.prototype.fetchMetadataHashByUserId = fetchMetadataHashByUserIdMock;

      const fetchIpfsMock = vi.fn().mockRejectedValue(new Error('Error fetching IPFS data'));
      vi.spyOn(fetchIpfs, 'fetchIpfs').mockImplementation(fetchIpfsMock);

      // Act
      const result = await new TestMetadataManager(metadataSchema).fetchAccountMetadata(userId);

      // Assert
      expect(result).toBeUndefined();
      expect(fetchMetadataHashByUserIdMock).toHaveBeenCalledWith(userId);
      expect(fetchIpfsMock).toHaveBeenCalledWith(metadataHash);
    });
  });

  describe('pinAccountMetadata', () => {
    it('should return a mock hash when running in test mode', async () => {
      // Arrange
      const isTestMock = vi.fn(isTest).mockReturnValue(true);
      vi.mock('$lib/utils/is-test', () => ({
        default: vi.fn(),
      }));
      (isTest as Mock).mockImplementation(isTestMock);

      const data = 'Sample data';
      const metadataSchema = z.string();

      // Act
      const result = await new TestMetadataManager(metadataSchema).pinAccountMetadata(data);

      // Assert
      expect(result).toBeDefined();
      expect(isTestMock).toHaveBeenCalled();
    });

    it('should return a real hash when running in non-test mode', async () => {
      // Arrange
      const data = 'Sample data';
      const expectedHash = 'QmX';
      const metadataSchema = z.string();

      const fetchMock = vi.fn(fetch).mockResolvedValue(new Response(expectedHash));
      global.fetch = fetchMock;

      // Act
      const result = await new TestMetadataManager(metadataSchema).pinAccountMetadata(data);

      // Assert
      expect(result).toBe(expectedHash);
      expect(fetchMock).toHaveBeenCalledWith('/api/ipfs/pin', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    });

    it('should throw an error when pinning account metadata fails', async () => {
      // Arrange
      const data = 'Sample data';
      const metadataSchema = z.string();

      const fetchMock = vi
        .fn(fetch)
        .mockResolvedValue(new Response('Error pinning data', { status: 500 }));
      global.fetch = fetchMock;

      // Act & Assert
      await expect(
        new TestMetadataManager(metadataSchema).pinAccountMetadata(data),
      ).rejects.toThrowError('Pinning account metadata failed: Error pinning data');

      expect(fetchMock).toHaveBeenCalledWith('/api/ipfs/pin', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    });
  });

  describe('updateAccountMetadata', () => {
    it('should update metadata when current metadata hash matches on-chain value', async () => {
      // Arrange
      const userId = '1';
      const newData = { describes: { userId }, key: 'test', value: 'value' };

      const lastKnownHash = 'QmX';
      const fetchMetadataHashByUserIdMock = vi
        .fn(MetadataManagerBase.prototype.fetchMetadataHashByUserId)
        .mockResolvedValue(lastKnownHash);
      MetadataManagerBase.prototype.fetchMetadataHashByUserId = fetchMetadataHashByUserIdMock;

      const originalPinAccountMetadata = TestMetadataManager.prototype.pinAccountMetadata;
      const pinAccountMetadataMock = vi
        .fn(TestMetadataManager.prototype.pinAccountMetadata)
        .mockResolvedValue('newHash');
      TestMetadataManager.prototype.pinAccountMetadata = pinAccountMetadataMock;

      const tx = {} as ContractTransaction;
      const originalEmitUserMetadata = TestMetadataManager.prototype['emitUserMetadata'];
      const emitUserMetadataMock = vi
        .fn(TestMetadataManager.prototype['emitUserMetadata'])
        .mockResolvedValue(tx);
      MetadataManagerBase.prototype['emitUserMetadata'] = emitUserMetadataMock;

      const clientMock = {
        emitUserMetadata: vi
          .fn(AddressDriverClient.prototype.emitUserMetadata)
          .mockResolvedValue(tx),
      } as unknown as AddressDriverClient;
      const originalGetClient = TestMetadataManager.prototype['getClient'];
      const getClientMock = vi
        .fn(TestMetadataManager.prototype['getClient'])
        .mockResolvedValue(clientMock);
      MetadataManagerBase.prototype['getClient'] = getClientMock;

      // Act
      const result = await new TestMetadataManager(
        addressDriverAccountMetadataSchema,
      ).updateAccountMetadata(newData, lastKnownHash);

      // Assert
      expect(result.newHash).toEqual('newHash');
      expect(result.tx).toBeDefined();
      expect(fetchMetadataHashByUserIdMock).toHaveBeenCalledWith(userId);
      expect(pinAccountMetadataMock).toHaveBeenCalledWith(newData);
      expect(emitUserMetadataMock).toHaveBeenCalledWith(clientMock, 'newHash', userId);
      expect(getClientMock).toHaveBeenCalledWith(addressDriverAccountMetadataSchema);

      TestMetadataManager.prototype.pinAccountMetadata = originalPinAccountMetadata;
      TestMetadataManager.prototype['emitUserMetadata'] = originalEmitUserMetadata;
      TestMetadataManager.prototype['getClient'] = originalGetClient;
    });

    it('should throw an error when current metadata hash does not match on-chain value', async () => {
      const userId = '1';
      const newData = { describes: { userId }, key: 'test', value: 'value' };

      const lastKnownHash = 'QmX';
      const currentOnChainHash = 'QmY';
      const fetchMetadataHashByUserIdMock = vi
        .spyOn(MetadataManagerBase.prototype, 'fetchMetadataHashByUserId')
        .mockResolvedValue(currentOnChainHash);

      const instance = new TestMetadataManager(addressDriverAccountMetadataSchema);

      await expect(instance.updateAccountMetadata(newData, lastKnownHash)).rejects.toThrow(
        "Current metadata hash doesn't match on-chain value." +
          'If your account was edited elsewhere previously, please refresh the page before making further changes.',
      );

      fetchMetadataHashByUserIdMock.mockRestore();
    });
  });

  describe('emitUserMetadata', () => {
    it('should call NFTDriverClient.emitUserMetadata when client has safeCreateAccount', async () => {
      // Arrange
      const client: NFTDriverClient = {
        safeCreateAccount: vi.fn(),
        emitUserMetadata: vi.fn().mockResolvedValue({} as ContractTransaction),
      } as unknown as NFTDriverClient;

      const testMetadataManager = new TestMetadataManager(addressDriverAccountMetadataSchema);
      const newHash = 'newHash';
      const userId = '1';

      // Act
      const result = await testMetadataManager['emitUserMetadata'](client, newHash, userId);

      // Assert
      expect(client.emitUserMetadata).toHaveBeenCalledWith(userId, [
        { key: MetadataManagerBase.USER_METADATA_KEY, value: newHash },
      ]);
      expect(result).toBeDefined();
    });

    it('should call AddressDriverClient.emitUserMetadata when client has getUserId', async () => {
      // Arrange
      const client: AddressDriverClient = {
        getUserId: vi.fn(),
        emitUserMetadata: vi.fn().mockResolvedValue({} as ContractTransaction),
      } as unknown as AddressDriverClient;

      const testMetadataManager = new TestMetadataManager(addressDriverAccountMetadataSchema);
      const newHash = 'newHash';
      const userId = '1';

      // Act
      const result = await testMetadataManager['emitUserMetadata'](client, newHash, userId);

      // Assert
      expect(client.emitUserMetadata).toHaveBeenCalledWith([
        { key: MetadataManagerBase.USER_METADATA_KEY, value: newHash },
      ]);
      expect(result).toBeDefined();
    });

    it('should call GitDriverClient.emitUserMetadata when client has getProjectId', async () => {
      // Arrange
      const client: GitDriverClient = {
        getProjectId: vi.fn(),
        emitUserMetadata: vi.fn().mockResolvedValue({} as ContractTransaction),
      } as unknown as GitDriverClient;

      const testMetadataManager = new TestMetadataManager(gitDriverAccountMetadataSchema);
      const newHash = 'newHash';
      const userId = '1';

      // Act
      const result = await testMetadataManager['emitUserMetadata'](client, newHash, userId);

      // Assert
      expect(client.emitUserMetadata).toHaveBeenCalledWith(userId, [
        { key: MetadataManagerBase.USER_METADATA_KEY, value: newHash },
      ]);
      expect(result).toBeDefined();
    });

    it('should throw an error for unsupported client in emitUserMetadata', async () => {
      // Arrange
      const client = {} as any;

      const testMetadataManager = new TestMetadataManager(addressDriverAccountMetadataSchema);
      const newHash = 'newHash';
      const userId = '1';

      // Act & Assert
      await expect(
        testMetadataManager['emitUserMetadata'](client, newHash, userId),
      ).rejects.toThrow('Unsupported client');
    });
  });

  describe('getClient', () => {
    it('should return a AddressDriverClient when address driver account metadata schema is provided', async () => {
      // Act
      const result = await new TestMetadataManager(addressDriverAccountMetadataSchema)['getClient'](
        addressDriverAccountMetadataSchema,
      );

      // Assert
      expect(result).toBeInstanceOf(AddressDriverClient);
    });

    it('should return a NFTDriverClient when NFT driver account metadata schema is provided', async () => {
      // Arrange
      const testMetadataManager = new TestMetadataManager(
        nftDriverAccountMetadataSchema,
        {} as any,
      );

      const spy = vi
        .spyOn(getDripsClients, 'getNFTDriverClient')
        .mockImplementation(() => ({} as any));

      // Act
      await testMetadataManager['getClient'](nftDriverAccountMetadataSchema);

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it('should return a GitDriverClient when Git driver account metadata schema is provided', async () => {
      // Arrange
      const testMetadataManager = new TestMetadataManager(
        nftDriverAccountMetadataSchema,
        {} as any,
      );

      const spy = vi
        .spyOn(getDripsClients, 'getGitDriverClient')
        .mockImplementation(() => ({} as any));

      // Act
      await testMetadataManager['getClient'](gitDriverAccountMetadataSchema);

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it('should throw an error for unsupported schema in getClient', async () => {
      // Arrange
      const unsupportedSchema = z.string();
      const testMetadataManager = new TestMetadataManager(addressDriverAccountMetadataSchema);

      // Act & Assert
      await expect(testMetadataManager['getClient'](unsupportedSchema)).rejects.toThrow(
        'Unsupported schema',
      );
    });
  });
});
