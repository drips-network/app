import { AddressDriverClient, DripsSubgraphClient } from 'radicle-drips';
import NftDriverMetadataManager from '../NftDriverMetadataManager';
import type { NFTDriverAccount } from '../types';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type { LatestVersion } from '@efstajas/versioned-parser/lib/types';
import type { nftDriverAccountMetadataParser } from '../schemas';
import unreachable from '$lib/utils/unreachable';

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
        accountId: '1',
        owner: {
          address: '0x2902A95209dD88b9C7c379C824AF5B07D8C7Fc5a',
          accountId: '1245',
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
      await expect(metadataMgr.fetchAccount(expectedAccount.accountId)).rejects.toThrowError();
      expect(subgraphClientMock.getNftSubAccountOwnerByTokenId).toHaveBeenCalledWith(
        expectedAccount.accountId,
      );
    });

    it('should return the account if the user has an NFT sub-account', async () => {
      // Arrange
      const expectedAccount = {
        driver: 'nft',
        accountId: '1',
        owner: {
          address: '0x2902A95209dD88b9C7c379C824AF5B07D8C7Fc5a',
          accountId: '1245',
          driver: 'address',
        },
      } as NFTDriverAccount;

      const subgraphClientMock = {
        getNftSubAccountOwnerByTokenId: vi
          .fn(DripsSubgraphClient.prototype.getNftSubAccountOwnerByTokenId)
          .mockResolvedValue({
            tokenId: expectedAccount.accountId,
            ownerAddress: expectedAccount.owner.address,
          }),
      } as unknown as DripsSubgraphClient;
      const addressDriverClientMock = {
        getAccountIdByAddress: vi
          .fn(AddressDriverClient.prototype.getAccountIdByAddress)
          .mockResolvedValue(expectedAccount.owner.accountId),
      };
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getSubgraphClient = vi.fn().mockImplementation(() => subgraphClientMock);
      getClient.getAddressDriverClient = vi.fn().mockImplementation(() => addressDriverClientMock);

      const metadataMgr = new NftDriverMetadataManager();

      // Act
      const account = await metadataMgr.fetchAccount(expectedAccount.accountId);

      // Assert
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(account!).toEqual(expectedAccount);
      expect(subgraphClientMock.getNftSubAccountOwnerByTokenId).toHaveBeenCalledWith(
        expectedAccount.accountId,
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
          accountId: '1',
          owner: {
            address: '0x2902A95209dD88b9C7c379C824AF5B07D8C7Fc5a',
            accountId: '1245',
            driver: 'address',
          },
        } as NFTDriverAccount,
        projects: [
          {
            weight: 1,
            accountId: '1',
            source: {
              forge: 'github',
              repoName: 'repo',
              url: 'repo.com',
            },
          },
        ] as LatestVersion<typeof nftDriverAccountMetadataParser>['projects'],
      };

      // Act
      const metadata = metadataMgr.buildAccountMetadata(context);

      // Assert
      expect(metadata).toEqual({
        driver: 'nft',
        name: undefined,
        describes: {
          driver: context.forAccount.driver,
          accountId: context.forAccount.accountId,
        },
        isDripList: true,
        projects: mapFilterUndefined(context.projects, (listProj) => ({
          accountId: context.forAccount.accountId,
          weight: listProj.weight,
          source: 'source' in listProj ? listProj.source : unreachable(),
        })),
      });
    });
  });
});
