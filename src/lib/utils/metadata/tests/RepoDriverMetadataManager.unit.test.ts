/* eslint-disable @typescript-eslint/no-explicit-any */
import { Forge, RepoDriverClient } from 'radicle-drips';
import RepoDriverMetadataManager from '../RepoDriverMetadataManager';
import MetadataManagerBase from '../MetadataManagerBase';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

describe('RepoDriverMetadataManager', () => {
  vi.mock('$lib/utils/get-drips-clients');

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchAccountMetadata', () => {
    it('should return the metadata if metadata is valid', async () => {
      // Arrange
      const userId = '2';
      const repoOwner = '0x123';
      const gitUrl = 'http://github.com/username/repo';

      const originalFetchAccountMetadata = MetadataManagerBase.prototype.fetchAccountMetadata;
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue({
          hash: '0x123',
          data: {
            source: {
              forge: 'github',
              url: gitUrl,
              repoName: 'repo',
            },
          },
        });
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const repoDriverClientMock = {
        getUserId: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue(userId),
        getRepoOwner: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue(repoOwner),
      } as unknown as RepoDriverClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getRepoDriverClient = vi.fn().mockImplementation(() => repoDriverClientMock);

      // Act
      const result = await new RepoDriverMetadataManager().fetchAccountMetadata('2');

      // Assert
      expect(result).toEqual({
        hash: '0x123',
        data: {
          source: {
            forge: 'github',
            url: gitUrl,
            repoName: 'repo',
          },
        },
      });
      expect(fetchAccountMetadataMock).toHaveBeenCalledWith(userId);
      expect(repoDriverClientMock.getUserId).toHaveBeenCalledWith(Forge.GitHub, 'repo');

      MetadataManagerBase.prototype.fetchAccountMetadata = originalFetchAccountMetadata;
    });

    it('should throw if on-chain user ID does not match with the provided user ID', async () => {
      const userId = '2';
      const gitUrl = 'http://github.com/username/repo';

      const originalFetchAccountMetadata = MetadataManagerBase.prototype.fetchAccountMetadata;
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue({
          hash: '0x123',
          data: {
            source: {
              forge: 'github',
              url: gitUrl,
              repoName: 'repo',
            },
          },
        });
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const repoDriverClientMock = {
        getUserId: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue(userId),
      } as unknown as RepoDriverClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getRepoDriverClient = vi.fn().mockImplementation(() => repoDriverClientMock);

      // Act
      await expect(new RepoDriverMetadataManager().fetchAccountMetadata('3')).rejects.toThrow();

      // Assert
      expect(fetchAccountMetadataMock).toHaveBeenCalledWith('3');
      expect(repoDriverClientMock.getUserId).toHaveBeenCalledWith(Forge.GitHub, 'repo');

      MetadataManagerBase.prototype.fetchAccountMetadata = originalFetchAccountMetadata;
    });

    it('should return null if the account metadata is missing', async () => {
      // Arrange
      const userId = '2';

      const originalFetchAccountMetadata = MetadataManagerBase.prototype.fetchAccountMetadata;
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue(null as any);
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const repoDriverClientMock = {
        getUserId: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue(userId),
      } as unknown as RepoDriverClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getRepoDriverClient = vi.fn().mockImplementation(() => repoDriverClientMock);

      // Act
      const result = await new RepoDriverMetadataManager().fetchAccountMetadata('2');

      // Assert
      expect(result).toBeNull;
      expect(repoDriverClientMock.getUserId).not.toBeCalled();
      expect(fetchAccountMetadataMock).toHaveBeenCalledWith(userId);

      MetadataManagerBase.prototype.fetchAccountMetadata = originalFetchAccountMetadata;
    });

    it('should throw if the url does not include the repo name', async () => {
      // Arrange
      const userId = '2';
      const gitUrl = 'http://github.com/username/repo';

      const originalFetchAccountMetadata = MetadataManagerBase.prototype.fetchAccountMetadata;
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue({
          hash: '0x123',
          data: {
            source: {
              forge: 'github',
              url: gitUrl,
              repoName: 'random-repo-name',
            },
          },
        } as any as any);
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const repoDriverClientMock = {
        getUserId: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue(userId),
      } as unknown as RepoDriverClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getRepoDriverClient = vi.fn().mockImplementation(() => repoDriverClientMock);

      // Act
      await expect(new RepoDriverMetadataManager().fetchAccountMetadata(userId)).rejects.toThrow();

      // Assert
      expect(fetchAccountMetadataMock).toHaveBeenCalledWith(userId);
      expect(repoDriverClientMock.getUserId).toHaveBeenCalledWith(Forge.GitHub, 'random-repo-name');

      MetadataManagerBase.prototype.fetchAccountMetadata = originalFetchAccountMetadata;
    });
  });

  describe('fetchAccount', () => {
    it('should return null when the account metadata is not found', async () => {
      // Arrange
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue(undefined as any);
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const repoDriverClientMock = {
        getUserId: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue('2'),
      } as unknown as RepoDriverClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getRepoDriverClient = vi.fn().mockImplementation(() => repoDriverClientMock);

      const metadataMgr = new RepoDriverMetadataManager();

      // Act
      const account = await metadataMgr.fetchAccount('1');

      // Assert
      expect(account).toBeNull();
      expect(fetchAccountMetadataMock).toHaveBeenCalledWith('1');
    });

    it('should return the account when the account metadata is found', async () => {
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue({
          data: {
            describes: {
              userId: '1',
              driver: 'repo',
            },
          },
        } as any);
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const repoDriverClientMock = {
        getUserId: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue('2'),
      } as unknown as RepoDriverClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getRepoDriverClient = vi.fn().mockImplementation(() => repoDriverClientMock);

      const metadataMgr = new RepoDriverMetadataManager();

      // Act
      const account = await metadataMgr.fetchAccount('1');

      // Assert
      expect(account).toEqual({
        userId: '1',
        driver: 'repo',
      });
      expect(fetchAccountMetadataMock).toHaveBeenCalledWith('1');
    });
  });

  describe('buildAccountMetadata', () => {
    it('should return the account metadata', async () => {
      // Arrange
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue(undefined as any);
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const repoDriverClientMock = {
        getUserId: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue('2'),
      } as unknown as RepoDriverClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getRepoDriverClient = vi.fn().mockImplementation(() => repoDriverClientMock);

      const metadataMgr = new RepoDriverMetadataManager();
      const context = {
        forProject: {
          owner: {
            driver: 'address',
            userId: '2',
            address: '0x123',
          },
          repoDriverAccount: {
            driver: 'repo',
            userId: '1',
          },
          source: {
            url: 'repo',
            repoName: 'repo',
          },
          emoji: '👍',
          color: 'red',
          description: 'description',
        },
        forSplits: {
          maintainers: [
            {
              weight: 1,
              userId: '10',
            },
          ],
          dependencies: [
            {
              weight: 10,
              userId: '100',
            },
          ],
          dripsDonation: {
            weight: 100,
            userId: '1000',
          },
        },
      } as any;

      // Act
      const metadata = metadataMgr.buildAccountMetadata(context);

      // Assert
      expect(metadata).toEqual({
        driver: 'repo',
        describes: {
          userId: '1',
          driver: 'repo',
        },
        source: {
          url: 'repo',
          repoName: 'repo',
        },
        emoji: '👍',
        color: 'red',
        description: 'description',
        splits: {
          maintainers: [
            {
              weight: 1,
              userId: '10',
            },
          ],
          dependencies: [
            {
              weight: 10,
              userId: '100',
            },
          ],
          dripsDonation: {
            weight: 100,
            userId: '1000',
          },
        },
      });
    });
  });
});
