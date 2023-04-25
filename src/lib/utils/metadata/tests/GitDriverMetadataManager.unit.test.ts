import { GitDriverClient } from 'radicle-drips';
import GitDriverMetadataManager from '../GitDriverMetadataManager';
import MetadataManagerBase from '../MetadataManagerBase';

describe('GitDriverMetadataManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('verifySourceMetadata', () => {
    it('should return true if the source metadata is valid', async () => {
      // Arrange
      const projectId = '1';
      const gitUrl = 'http://github.com/username/repo';

      const originalFetchAccountMetadata = MetadataManagerBase.prototype.fetchAccountMetadata;
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue({
          data: {
            source: {
              url: gitUrl,
              repoName: 'repo',
            },
          },
        } as any);
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const gitDriverClientMock = {
        getProjectId: vi.fn(GitDriverClient.prototype.getProjectId).mockResolvedValue(projectId),
      } as unknown as GitDriverClient;

      // Act
      const result = await new GitDriverMetadataManager(gitDriverClientMock).verifySourceMetadata(
        projectId,
      );

      // Assert
      expect(result).toBe(true);
      expect(fetchAccountMetadataMock).toHaveBeenCalledWith(projectId);
      expect(gitDriverClientMock.getProjectId).toHaveBeenCalledWith(gitUrl);

      MetadataManagerBase.prototype.fetchAccountMetadata = originalFetchAccountMetadata;
    });

    it('should return false if the source metadata is invalid', async () => {
      // Arrange
      const projectId = '1';
      const gitUrl = 'http://github.com/username/repo';

      const originalFetchAccountMetadata = MetadataManagerBase.prototype.fetchAccountMetadata;
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue({
          data: {
            source: {
              url: gitUrl,
              repoName: 'repo',
            },
          },
        } as any);
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const gitDriverClientMock = {
        getProjectId: vi.fn(GitDriverClient.prototype.getProjectId).mockResolvedValue('2'),
      } as unknown as GitDriverClient;

      // Act
      const result = await new GitDriverMetadataManager(gitDriverClientMock).verifySourceMetadata(
        projectId,
      );

      // Assert
      expect(result).toBe(false);
      expect(fetchAccountMetadataMock).toHaveBeenCalledWith(projectId);
      expect(gitDriverClientMock.getProjectId).toHaveBeenCalledWith(gitUrl);

      MetadataManagerBase.prototype.fetchAccountMetadata = originalFetchAccountMetadata;
    });

    it('should return false if the source metadata is missing', async () => {
      // Arrange
      const projectId = '1';

      const originalFetchAccountMetadata = MetadataManagerBase.prototype.fetchAccountMetadata;
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue(undefined as any);
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const gitDriverClientMock = {
        getProjectId: vi.fn(GitDriverClient.prototype.getProjectId).mockResolvedValue('2'),
      } as unknown as GitDriverClient;

      // Act
      const result = await new GitDriverMetadataManager(gitDriverClientMock).verifySourceMetadata(
        projectId,
      );

      // Assert
      expect(result).toBe(false);
      expect(gitDriverClientMock.getProjectId).not.toBeCalled();
      expect(fetchAccountMetadataMock).toHaveBeenCalledWith(projectId);

      MetadataManagerBase.prototype.fetchAccountMetadata = originalFetchAccountMetadata;
    });

    it('should return false if the url does not include the repo name', async () => {
      // Arrange
      const projectId = '1';
      const gitUrl = 'http://github.com/username/repo';

      const originalFetchAccountMetadata = MetadataManagerBase.prototype.fetchAccountMetadata;
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue({
          data: {
            source: {
              url: gitUrl,
              repoName: 'random',
            },
          },
        } as any);
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const gitDriverClientMock = {
        getProjectId: vi.fn(GitDriverClient.prototype.getProjectId).mockResolvedValue(projectId),
      } as unknown as GitDriverClient;

      // Act
      const result = await new GitDriverMetadataManager(gitDriverClientMock).verifySourceMetadata(
        projectId,
      );

      // Assert
      expect(result).toBe(false);
      expect(fetchAccountMetadataMock).toHaveBeenCalledWith(projectId);
      expect(gitDriverClientMock.getProjectId).toHaveBeenCalledWith(gitUrl);

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

      const gitDriverClientMock = {
        getProjectId: vi.fn(GitDriverClient.prototype.getProjectId).mockResolvedValue('2'),
      } as unknown as GitDriverClient;

      const metadataMgr = new GitDriverMetadataManager(gitDriverClientMock);

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
              driver: 'git',
            },
          },
        } as any);
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const gitDriverClientMock = {
        getProjectId: vi.fn(GitDriverClient.prototype.getProjectId).mockResolvedValue('2'),
      } as unknown as GitDriverClient;

      const metadataMgr = new GitDriverMetadataManager(gitDriverClientMock);

      // Act
      const account = await metadataMgr.fetchAccount('1');

      // Assert
      expect(account).toEqual({
        userId: '1',
        driver: 'git',
      });
      expect(fetchAccountMetadataMock).toHaveBeenCalledWith('1');
    });
  });

  describe('buildAccountMetadata', () => {
    it('should return the account metadata', () => {
      // Arrange
      const fetchAccountMetadataMock = vi
        .fn(MetadataManagerBase.prototype.fetchAccountMetadata)
        .mockResolvedValue(undefined as any);
      MetadataManagerBase.prototype.fetchAccountMetadata = fetchAccountMetadataMock;

      const gitDriverClientMock = {
        getProjectId: vi.fn(GitDriverClient.prototype.getProjectId).mockResolvedValue('2'),
      } as unknown as GitDriverClient;

      const metadataMgr = new GitDriverMetadataManager(gitDriverClientMock);
      const context = {
        forProject: {
          owner: {
            driver: 'address',
            userId: '2',
            address: '0x123',
          },
          gitDriverAccount: {
            driver: 'git',
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
        driver: 'git',
        describes: {
          userId: '1',
          driver: 'git',
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
