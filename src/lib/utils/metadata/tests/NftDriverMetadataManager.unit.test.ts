import { AddressDriverClient, DripsSubgraphClient } from 'radicle-drips';
import NftDriverMetadataManager from '../NftDriverMetadataManager';
import type { NFTDriverAccount } from '../types';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

vi.mock('$lib/stores/wallet/wallet.store');

describe('NftDriverMetadataManager', () => {
  vi.mock('$lib/utils/get-drips-clients');

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchAccount', () => {
    it('should return null if the user does not have an NFT sub-account', async () => {
      // Arrange
      const subgraphClientMock = {
        getNftSubAccountOwnerByTokenId: vi
          .fn(DripsSubgraphClient.prototype.getNftSubAccountOwnerByTokenId)
          .mockResolvedValue(null),
      } as unknown as DripsSubgraphClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getSubgraphClient = vi.fn().mockImplementation(() => subgraphClientMock);

      const metadataMgr = new NftDriverMetadataManager();

      // Act
      const account = await metadataMgr.fetchAccount('1');

      // Assert
      expect(account).toBeNull();
      expect(subgraphClientMock.getNftSubAccountOwnerByTokenId).toHaveBeenCalledWith('1');
    });

    it('should throw if the user IDs do not match', async () => {
      // Arrange
      const expectedAccount = {
        driver: 'nft',
        userId: '1',
        owner: {
          address: '0x2902A95209dD88b9C7c379C824AF5B07D8C7Fc5a',
          userId: '1245',
          driver: 'address',
        },
      } as NFTDriverAccount;

      const subgraphClientMock = {
        getNftSubAccountOwnerByTokenId: vi
          .fn(DripsSubgraphClient.prototype.getNftSubAccountOwnerByTokenId)
          .mockResolvedValue({
            tokenId: '2',
            ownerAddress: expectedAccount.owner.address,
          }),
      } as unknown as DripsSubgraphClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getSubgraphClient = vi.fn().mockImplementation(() => subgraphClientMock);

      const metadataMgr = new NftDriverMetadataManager();

      // Act & Assert
      await expect(metadataMgr.fetchAccount(expectedAccount.userId)).rejects.toThrowError();
      expect(subgraphClientMock.getNftSubAccountOwnerByTokenId).toHaveBeenCalledWith(
        expectedAccount.userId,
      );
    });

    it('should return the account if the user has an NFT sub-account', async () => {
      // Arrange
      const expectedAccount = {
        driver: 'nft',
        userId: '1',
        owner: {
          address: '0x2902A95209dD88b9C7c379C824AF5B07D8C7Fc5a',
          userId: '1245',
          driver: 'address',
        },
      } as NFTDriverAccount;

      const subgraphClientMock = {
        getNftSubAccountOwnerByTokenId: vi
          .fn(DripsSubgraphClient.prototype.getNftSubAccountOwnerByTokenId)
          .mockResolvedValue({
            tokenId: expectedAccount.userId,
            ownerAddress: expectedAccount.owner.address,
          }),
      } as unknown as DripsSubgraphClient;
      const addressDriverClientMock = {
        getUserIdByAddress: vi
          .fn(AddressDriverClient.prototype.getUserIdByAddress)
          .mockResolvedValue(expectedAccount.owner.userId),
      };
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getSubgraphClient = vi.fn().mockImplementation(() => subgraphClientMock);
      getClient.getAddressDriverClient = vi.fn().mockImplementation(() => addressDriverClientMock);

      const metadataMgr = new NftDriverMetadataManager();

      // Act
      const account = await metadataMgr.fetchAccount(expectedAccount.userId);

      // Assert
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(account!).toEqual(expectedAccount);
      expect(subgraphClientMock.getNftSubAccountOwnerByTokenId).toHaveBeenCalledWith(
        expectedAccount.userId,
      );
    });
  });

  describe('buildAccountMetadata', () => {
    it('should return the account metadata', () => {
      // Arrange
      const metadataMgr = new NftDriverMetadataManager();

      const context = {
        forAccount: {
          driver: 'nft',
          userId: '1',
          owner: {
            address: '0x2902A95209dD88b9C7c379C824AF5B07D8C7Fc5a',
            userId: '1245',
            driver: 'address',
          },
        } as NFTDriverAccount,
      };

      // Act
      const metadata = metadataMgr.buildAccountMetadata(context);

      // Assert
      expect(metadata).toEqual({
        driver: 'nft',
        describes: {
          driver: context.forAccount.driver,
          userId: context.forAccount.userId,
        },
        isDripList: true,
      });
    });
  });
});
