import * as getDripsClients from '$lib/utils/get-drips-clients';
import { z } from 'zod';
import * as fetchIpfs from '$lib/utils/ipfs';
import isTest from '$lib/utils/is-test';
import type { Mock } from 'vitest';
import { AddressDriverClient, DripsSubgraphClient } from 'radicle-drips';
import MetadataManagerBase from '../MetadataManagerBase';
import {
  addressDriverAccountMetadataSchema,
  repoDriverAccountMetadataSchema,
  nftDriverAccountMetadataSchema,
} from '../schemas';
import type { ContractTransaction } from 'ethers';
import type { NFTDriverAccount } from '../types';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

class TestMetadataManager<TAccountMetadataSchema extends z.ZodType> extends MetadataManagerBase<
  TAccountMetadataSchema,
  NFTDriverAccount
> {
  public fetchAccount<TAccount>(): Promise<TAccount | null> {
    throw new Error('Method not implemented.');
  }
  public buildAccountMetadata(): z.TypeOf<TAccountMetadataSchema> {
    throw new Error('Method not implemented.');
  }
  constructor(metadataSchema: TAccountMetadataSchema) {
    super(metadataSchema);
  }
}

describe('MetadataManagerBase', () => {
  vi.mock('$lib/utils/get-drips-clients');

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchMetadataHashByAccountId', () => {
    it('should fetch metadata hash', async () => {
      // Arrange
      const accountId = '1';
      const expectedMetadata = {
        id: '1',
        key: MetadataManagerBase.USER_METADATA_KEY,
        value: 'QmX',
        accountId: '1',
        lastUpdatedBlockTimestamp: 1n,
      };

      const subgraphClientMock = {
        getLatestAccountMetadata: vi
          .fn(DripsSubgraphClient.prototype.getLatestAccountMetadata)
          .mockResolvedValue(expectedMetadata),
      } as unknown as DripsSubgraphClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getSubgraphClient = vi.fn().mockImplementation(() => subgraphClientMock);

      const testMetadataManager = new TestMetadataManager(addressDriverAccountMetadataSchema);

      // Act
      const metadataHash = await testMetadataManager.fetchMetadataHashByAccountId(accountId);

      // Assert
      expect(metadataHash).toEqual(expectedMetadata.value);
      expect(subgraphClientMock.getLatestAccountMetadata).toHaveBeenCalledWith(
        accountId,
        MetadataManagerBase.USER_METADATA_KEY,
      );
    });
  });

  describe('fetchAccountMetadata', () => {
    it('should return the mocked metadata from localStorage when running in test mode', async () => {
      // Arrange
      const accountId = '1';
      const metadataHash = 'QmX';

      const fetchMetadataHashByAccountIdMock = vi
        .fn(MetadataManagerBase.prototype.fetchMetadataHashByAccountId)
        .mockResolvedValue(metadataHash);
      MetadataManagerBase.prototype.fetchMetadataHashByAccountId = fetchMetadataHashByAccountIdMock;

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
        z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          emoji: z.string().optional(),
        }),
      ).fetchAccountMetadata(accountId);

      // Assert
      expect(result).toEqual({ hash: metadataHash, data: expectedMetadata });
      expect(fetchMetadataHashByAccountIdMock).toHaveBeenCalledWith(accountId);
    });

    it('should return metadata when metadata hash is found and IPFS fetch is successful', async () => {
      // Arrange
      const accountId = '1';
      const metadataHash = 'QmX';
      const metadataSchema = z.string();
      const expectedMetadata = 'Sample metadata';

      const fetchMetadataHashByAccountIdMock = vi
        .fn(MetadataManagerBase.prototype.fetchMetadataHashByAccountId)
        .mockResolvedValue(metadataHash);
      MetadataManagerBase.prototype.fetchMetadataHashByAccountId = fetchMetadataHashByAccountIdMock;

      const fetchIpfsMock = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(expectedMetadata)));
      vi.spyOn(fetchIpfs, 'fetchIpfs').mockImplementation(fetchIpfsMock);

      // Act
      const result = await new TestMetadataManager(metadataSchema).fetchAccountMetadata(accountId);

      // Assert
      expect(result).toEqual({ hash: metadataHash, data: expectedMetadata });
      expect(fetchMetadataHashByAccountIdMock).toHaveBeenCalledWith(accountId);
      expect(fetchIpfsMock).toHaveBeenCalledWith(metadataHash);
    });

    it('should return null when metadata hash is not found', async () => {
      // Arrange
      const accountId = '1';
      const metadataSchema = z.string();

      const subgraphClientMock = {
        getLatestAccountMetadata: vi
          .fn(DripsSubgraphClient.prototype.getLatestAccountMetadata)
          .mockResolvedValue(null as any),
      } as unknown as DripsSubgraphClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getSubgraphClient = vi.fn().mockImplementation(() => subgraphClientMock);

      // Act
      const result = await new TestMetadataManager(metadataSchema).fetchAccountMetadata(accountId);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when fetchIpfs throws an error', async () => {
      // Arrange
      const accountId = '1';
      const metadataHash = 'QmX';
      const metadataSchema = z.string();

      const fetchMetadataHashByAccountIdMock = vi
        .fn(MetadataManagerBase.prototype.fetchMetadataHashByAccountId)
        .mockResolvedValue(metadataHash);
      MetadataManagerBase.prototype.fetchMetadataHashByAccountId = fetchMetadataHashByAccountIdMock;

      const fetchIpfsMock = vi.fn().mockRejectedValue(new Error('Error fetching IPFS data'));
      vi.spyOn(fetchIpfs, 'fetchIpfs').mockImplementation(fetchIpfsMock);

      // Act
      const result = await new TestMetadataManager(metadataSchema).fetchAccountMetadata(accountId);

      // Assert
      expect(result).toBeNull();
      expect(fetchMetadataHashByAccountIdMock).toHaveBeenCalledWith(accountId);
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
      const accountId = '1';
      const newData = { describes: { accountId }, key: 'test', value: 'value' };

      const lastKnownHash = 'QmX';
      const fetchMetadataHashByAccountIdMock = vi
        .fn(MetadataManagerBase.prototype.fetchMetadataHashByAccountId)
        .mockResolvedValue(lastKnownHash);
      MetadataManagerBase.prototype.fetchMetadataHashByAccountId = fetchMetadataHashByAccountIdMock;

      const originalPinAccountMetadata = TestMetadataManager.prototype.pinAccountMetadata;
      const pinAccountMetadataMock = vi
        .fn(TestMetadataManager.prototype.pinAccountMetadata)
        .mockResolvedValue('newHash');
      TestMetadataManager.prototype.pinAccountMetadata = pinAccountMetadataMock;

      const tx = {} as ContractTransaction;
      const originalEmitAccountMetadata = TestMetadataManager.prototype['emitAccountMetadata'];
      const emitAccountMetadataMock = vi
        .fn(TestMetadataManager.prototype['emitAccountMetadata'])
        .mockResolvedValue(tx);
      MetadataManagerBase.prototype['emitAccountMetadata'] = emitAccountMetadataMock;

      // Act
      const result = await new TestMetadataManager(
        addressDriverAccountMetadataSchema,
      ).updateAccountMetadata(newData, lastKnownHash);

      // Assert
      expect(result.newHash).toEqual('newHash');
      expect(result.tx).toBeDefined();
      expect(fetchMetadataHashByAccountIdMock).toHaveBeenCalledWith(accountId);
      expect(pinAccountMetadataMock).toHaveBeenCalledWith(newData);
      expect(emitAccountMetadataMock).toHaveBeenCalledWith('newHash', accountId);

      TestMetadataManager.prototype.pinAccountMetadata = originalPinAccountMetadata;
      TestMetadataManager.prototype['emitAccountMetadata'] = originalEmitAccountMetadata;
    });

    it('should throw an error when current metadata hash does not match on-chain value', async () => {
      const accountId = '1';
      const newData = { describes: { accountId }, key: 'test', value: 'value' };

      const lastKnownHash = 'QmX';
      const currentOnChainHash = 'QmY';
      const fetchMetadataHashByAccountIdMock = vi
        .spyOn(MetadataManagerBase.prototype, 'fetchMetadataHashByAccountId')
        .mockResolvedValue(currentOnChainHash);

      const instance = new TestMetadataManager(addressDriverAccountMetadataSchema);

      await expect(instance.updateAccountMetadata(newData, lastKnownHash)).rejects.toThrow(
        "Current metadata hash doesn't match on-chain value." +
          'If your account was edited elsewhere previously, please refresh the page before making further changes.',
      );

      fetchMetadataHashByAccountIdMock.mockRestore();
    });
  });

  describe('emitAccountMetadata', () => {
    it('should call NFTDriverClient.emitAccountMetadata when client has safeCreateAccount', async () => {
      // Arrange
      const clientMock = {
        safeCreateAccount: vi.fn(),
        emitAccountMetadata: vi
          .fn(AddressDriverClient.prototype.emitAccountMetadata)
          .mockResolvedValue({} as ContractTransaction),
      } as unknown as AddressDriverClient;
      const originalGetClient = TestMetadataManager.prototype['getClient'];
      const getClientMock = vi
        .fn(TestMetadataManager.prototype['getClient'])
        .mockResolvedValue(clientMock);
      TestMetadataManager.prototype['getClient'] = getClientMock;

      const testMetadataManager = new TestMetadataManager(addressDriverAccountMetadataSchema);
      const newHash = 'newHash';
      const accountId = '1';

      // Act
      const result = await testMetadataManager['emitAccountMetadata'](newHash, accountId);

      // Assert
      expect(clientMock.emitAccountMetadata).toHaveBeenCalledWith(accountId, [
        { key: MetadataManagerBase.USER_METADATA_KEY, value: newHash },
      ]);
      expect(result).toBeDefined();

      TestMetadataManager.prototype['getClient'] = originalGetClient;
    });

    it('should call AddressDriverClient.emitAccountMetadata when client has getAccountId', async () => {
      // Arrange
      const clientMock = {
        getAccountId: vi.fn(),
        emitAccountMetadata: vi
          .fn(AddressDriverClient.prototype.emitAccountMetadata)
          .mockResolvedValue({} as ContractTransaction),
      } as unknown as AddressDriverClient;
      const originalGetClient = TestMetadataManager.prototype['getClient'];
      const getClientMock = vi
        .fn(TestMetadataManager.prototype['getClient'])
        .mockResolvedValue(clientMock);
      TestMetadataManager.prototype['getClient'] = getClientMock;

      const testMetadataManager = new TestMetadataManager(addressDriverAccountMetadataSchema);
      const newHash = 'newHash';
      const accountId = '1';

      // Act
      const result = await testMetadataManager['emitAccountMetadata'](newHash, accountId);

      // Assert
      expect(clientMock.emitAccountMetadata).toHaveBeenCalledWith([
        { key: MetadataManagerBase.USER_METADATA_KEY, value: newHash },
      ]);
      expect(result).toBeDefined();

      TestMetadataManager.prototype['getClient'] = originalGetClient;
    });

    it('should call RepoDriverClient.emitAccountMetadata when client has requestOwnerUpdate', async () => {
      // Arrange
      const clientMock = {
        requestOwnerUpdate: vi.fn(),
        emitAccountMetadata: vi
          .fn(AddressDriverClient.prototype.emitAccountMetadata)
          .mockResolvedValue({} as ContractTransaction),
      } as unknown as AddressDriverClient;
      const originalGetClient = TestMetadataManager.prototype['getClient'];
      const getClientMock = vi
        .fn(TestMetadataManager.prototype['getClient'])
        .mockResolvedValue(clientMock);
      TestMetadataManager.prototype['getClient'] = getClientMock;

      const testMetadataManager = new TestMetadataManager(repoDriverAccountMetadataSchema);
      const newHash = 'newHash';
      const accountId = '1';

      // Act
      const result = await testMetadataManager['emitAccountMetadata'](newHash, accountId);

      // Assert
      expect(clientMock.emitAccountMetadata).toHaveBeenCalledWith(accountId, [
        { key: MetadataManagerBase.USER_METADATA_KEY, value: newHash },
      ]);
      expect(result).toBeDefined();

      TestMetadataManager.prototype['getClient'] = originalGetClient;
    });

    it('should throw an error for unsupported client in emitAccountMetadata', async () => {
      // Arrange
      const clientMock = {
        emitAccountMetadata: vi
          .fn(AddressDriverClient.prototype.emitAccountMetadata)
          .mockResolvedValue({} as ContractTransaction),
      } as unknown as AddressDriverClient;
      const originalGetClient = TestMetadataManager.prototype['getClient'];
      const getClientMock = vi
        .fn(TestMetadataManager.prototype['getClient'])
        .mockResolvedValue(clientMock);
      TestMetadataManager.prototype['getClient'] = getClientMock;

      const testMetadataManager = new TestMetadataManager(addressDriverAccountMetadataSchema);
      const newHash = 'newHash';
      const accountId = '1';

      // Act & Assert
      await expect(testMetadataManager['emitAccountMetadata'](newHash, accountId)).rejects.toThrow(
        'Unsupported client',
      );

      TestMetadataManager.prototype['getClient'] = originalGetClient;
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
      const testMetadataManager = new TestMetadataManager(nftDriverAccountMetadataSchema);

      const spy = vi
        .spyOn(getDripsClients, 'getNFTDriverClient')
        .mockImplementation(() => ({} as any));

      // Act
      await testMetadataManager['getClient'](nftDriverAccountMetadataSchema);

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it('should return a RepoDriverClient when Git driver account metadata schema is provided', async () => {
      // Arrange
      const testMetadataManager = new TestMetadataManager(nftDriverAccountMetadataSchema);

      const spy = vi
        .spyOn(getDripsClients, 'getRepoDriverClient')
        .mockImplementation(() => ({} as any));

      // Act
      await testMetadataManager['getClient'](repoDriverAccountMetadataSchema);

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
