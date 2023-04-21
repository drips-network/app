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
});
