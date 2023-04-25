import { DripsSubgraphClient } from 'radicle-drips';
import NftDriverMetadataManager from '../NftDriverMetadataManager';
import type { NFTDriverAccount } from '../types';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';

describe('NftDriverMetadataManager', () => {
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

      const metadataMgr = new NftDriverMetadataManager(subgraphClientMock);

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
        owner: '0x123',
      } as NFTDriverAccount;

      const subgraphClientMock = {
        getNftSubAccountOwnerByTokenId: vi
          .fn(DripsSubgraphClient.prototype.getNftSubAccountOwnerByTokenId)
          .mockResolvedValue({
            tokenId: '2',
            ownerAddress: expectedAccount.owner,
          }),
      } as unknown as DripsSubgraphClient;

      const metadataMgr = new NftDriverMetadataManager(subgraphClientMock);

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
        owner: '0x123',
      } as NFTDriverAccount;

      const subgraphClientMock = {
        getNftSubAccountOwnerByTokenId: vi
          .fn(DripsSubgraphClient.prototype.getNftSubAccountOwnerByTokenId)
          .mockResolvedValue({
            tokenId: expectedAccount.userId,
            ownerAddress: expectedAccount.owner,
          }),
      } as unknown as DripsSubgraphClient;

      const metadataMgr = new NftDriverMetadataManager(subgraphClientMock);

      // Act
      const account = await metadataMgr.fetchAccount(expectedAccount.userId);

      // Assert
      expect(account!).toEqual(expectedAccount);
      expect(subgraphClientMock.getNftSubAccountOwnerByTokenId).toHaveBeenCalledWith(
        expectedAccount.userId,
      );
    });

    describe('buildAccountMetadata', () => {
      it('should return the account metadata', () => {
        // Arrange
        const metadataMgr = new NftDriverMetadataManager();

        const context = {
          forAccount: {
            driver: 'nft',
            userId: '1',
            owner: '0x123',
          } as NFTDriverAccount,
          projects: [
            {
              weight: 1,
              userId: '1',
              source: {
                repoName: 'repo',
                url: 'repo.com',
              },
            },
          ],
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
          projects: mapFilterUndefined(context.projects, (listProj) => ({
            userId: context.forAccount.userId,
            weight: listProj.weight,
            source: listProj.source,
          })),
        });
      });
    });
  });
});
