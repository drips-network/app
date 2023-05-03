import { Forge, RepoDriverClient } from 'radicle-drips';
import RepoDriverUtils from '../RepoDriverUtils';
import { ethers } from 'ethers';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

vi.mock('$lib/utils/get-drips-clients');

describe('RepoDriverUtils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('forgeFromString', () => {
    it('should return the expected forge', () => {
      // Act
      const ghForge = RepoDriverUtils.forgeFromString('github');
      const glForge = RepoDriverUtils.forgeFromString('gitlab');

      // Assert
      expect(ghForge).toBe(Forge.GitHub);
      expect(glForge).toBe(Forge.GitLab);
    });

    it('should throw an error if the forge is not supported', () => {
      // Act
      const forge = () => RepoDriverUtils.forgeFromString('not-supported');

      // Assert
      expect(forge).toThrow();
    });
  });

  describe('getOnChainInfo', () => {
    it('should return the expected on-chain info when repo is claimed', async () => {
      // Arrange
      const repoId = '1';
      const userId = '2';
      const repoOwner = '0x123';
      const repoName = 'radicle-drips';
      const forge = Forge.GitHub;

      const repoDriverClientMock = {
        getRepoId: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue(repoId),
        getUserId: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue(userId),
        getRepoOwner: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue(repoOwner),
      } as unknown as RepoDriverClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getRepoDriverClient = vi.fn().mockImplementation(() => repoDriverClientMock);

      // Act
      const onChainInfo = await RepoDriverUtils.getOnChainInfo(repoName, forge);

      // Assert
      expect(onChainInfo).toEqual({
        userId,
        repoId,
        ownerAddress: repoOwner,
        isClaimed: true,
      });
    });

    it('should return the expected on-chain info when repo is not claimed', async () => {
      // Arrange
      const repoId = '1';
      const userId = '2';
      const repoOwner = ethers.constants.AddressZero;
      const repoName = 'radicle-drips';
      const forge = Forge.GitHub;

      const repoDriverClientMock = {
        getRepoId: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue(repoId),
        getUserId: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue(userId),
        getRepoOwner: vi.fn(RepoDriverClient.prototype.getUserId).mockResolvedValue(repoOwner),
      } as unknown as RepoDriverClient;
      const getClient = await import('$lib/utils/get-drips-clients');
      getClient.getRepoDriverClient = vi.fn().mockImplementation(() => repoDriverClientMock);

      // Act
      const onChainInfo = await RepoDriverUtils.getOnChainInfo(repoName, forge);

      // Assert
      expect(onChainInfo).toEqual({
        userId,
        repoId,
        ownerAddress: null,
        isClaimed: false,
      });
    });
  });
});
