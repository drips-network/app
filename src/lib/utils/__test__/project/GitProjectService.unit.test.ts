import * as getClient from '$lib/utils/get-drips-clients';
import RepoDriverMetadataManager from '$lib/utils/metadata/RepoDriverMetadataManager';
import type { repoDriverAccountMetadataSchema } from '$lib/utils/metadata/schemas';
import {
  VerificationStatus,
  type UnclaimedGitProject,
  type ClaimedGitProject,
} from '$lib/utils/metadata/types';
import type { GitProject } from '$lib/utils/metadata/types';
import GitProjectService from '$lib/utils/project/GitProjectService';
import { constants, Wallet, type ContractTransaction } from 'ethers';
import { AddressDriverClient, Forge, RepoDriverClient, type RepoAccount } from 'radicle-drips';
import type { z } from 'zod';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

vi.mock('$lib/utils/get-drips-clients');
vi.mock('$lib/utils/metadata/RepoDriverMetadataManager');
vi.mock('$lib/utils/get-drips-clients');

describe('GitProjectService', () => {
  let sut: GitProjectService;
  let subgraphClientMock: any;
  let repoDriverClientMock: any;
  let addressDriverClientMock: any;
  let repoDriverMetadataManagerMock: any;

  beforeEach(async () => {
    addressDriverClientMock = {
      getUserIdByAddress: vi.fn(AddressDriverClient.prototype.getUserIdByAddress),
    };
    (getClient.getAddressDriverClient as any) = vi
      .fn()
      .mockImplementation(() => addressDriverClientMock);

    repoDriverClientMock = {
      getOwner: vi.fn(RepoDriverClient.prototype.getOwner),
      getUserId: vi.fn(RepoDriverClient.prototype.getUserId),
      requestOwnerUpdate: vi.fn(RepoDriverClient.prototype.requestOwnerUpdate),
    };
    (getClient.getRepoDriverClient as any) = vi.fn().mockImplementation(() => repoDriverClientMock);

    subgraphClientMock = {
      repoDriverQueries: {
        getRepoAccountById: vi.fn(),
      },
    };
    (getClient.getSubgraphClient as any) = vi.fn().mockImplementation(() => subgraphClientMock);

    repoDriverMetadataManagerMock = {
      fetchAccountMetadata: vi.fn(RepoDriverMetadataManager.prototype.fetchAccountMetadata),
    };
    (RepoDriverMetadataManager as any) = vi
      .fn()
      .mockImplementation(() => repoDriverMetadataManagerMock);

    sut = await GitProjectService.new();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('requestOwnerUpdate', () => {
    it('should call the repo driver client with the expected params', async () => {
      // Arrange
      repoDriverClientMock.requestOwnerUpdate.mockResolvedValueOnce(
        {} as unknown as ContractTransaction,
      );

      // Act
      await sut.requestOwnerUpdate(Forge.GitHub, 'repo-name');

      // Assert
      expect(repoDriverClientMock.requestOwnerUpdate).toHaveBeenCalledWith(
        Forge.GitHub,
        'repo-name',
      );
    });
  });

  describe('getByForgeAndRepoName', () => {
    it('should return the expected project', async () => {
      // Arrange
      repoDriverClientMock.getUserId.mockResolvedValueOnce('userId');

      const originalGetDripListProjects = sut['_getProject'];

      const expectedProject = {} as unknown as GitProject;

      sut['_getProject'] = vi.fn(sut['_getProject']).mockResolvedValueOnce(expectedProject);

      // Act
      const actualProject = await sut.getByForgeAndRepoName(Forge.GitHub, 'repo-name');

      // Assert
      expect(actualProject).toBe(expectedProject);
      expect(sut['_getProject']).toHaveBeenCalledWith('userId');

      sut['_getProject'] = originalGetDripListProjects;
    });
  });

  describe('getByUserId', () => {
    it('should return the expected project', async () => {
      // Arrange
      const originalGetDripListProjects = sut['_getProject'];

      const expectedProject = {} as unknown as GitProject;

      sut['_getProject'] = vi.fn(sut['_getProject']).mockResolvedValueOnce(expectedProject);

      // Act
      const actualProject = await sut.getByUserId('userId');

      // Assert
      expect(actualProject).toBe(expectedProject);
      expect(sut['_getProject']).toHaveBeenCalledWith('userId');

      sut['_getProject'] = originalGetDripListProjects;
    });
  });

  describe('_getProject', () => {
    it('should return null if the repo account is not found', async () => {
      // Arrange
      subgraphClientMock.repoDriverQueries.getRepoAccountById = vi
        .fn(subgraphClientMock.repoDriverQueries.getRepoAccountById)
        .mockResolvedValueOnce(null);

      // Act
      const actualProject = await sut['_getProject']('userId');

      // Assert
      expect(actualProject).toBeNull();
    });

    it('should throw if the projectMetadata are not found', async () => {
      // Arrange
      subgraphClientMock.repoDriverQueries.getRepoAccountById = vi
        .fn(subgraphClientMock.repoDriverQueries.getRepoAccountById)
        .mockResolvedValueOnce({} as unknown as RepoAccount);

      repoDriverMetadataManagerMock.fetchAccountMetadata.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(sut['_getProject']('userId')).rejects.toThrow();
      expect(repoDriverMetadataManagerMock.fetchAccountMetadata).toHaveBeenCalledWith('userId');
      expect(repoDriverMetadataManagerMock.fetchAccountMetadata).toHaveBeenCalledTimes(1);
    });

    it('should return the expected unclaimed project', async () => {
      // Arrange
      const repoAccount = {
        status: 'not-started',
      } as unknown as RepoAccount;

      subgraphClientMock.repoDriverQueries.getRepoAccountById = vi
        .fn(subgraphClientMock.repoDriverQueries.getRepoAccountById)
        .mockResolvedValueOnce(repoAccount);

      const projectMetadata = {
        color: '#000000',
        description: 'description',
        emoji: 'emoji',
        source: {},
      } as unknown as z.infer<typeof repoDriverAccountMetadataSchema>;

      repoDriverMetadataManagerMock.fetchAccountMetadata.mockResolvedValueOnce({
        data: projectMetadata,
      });

      repoDriverClientMock.getOwner.mockResolvedValueOnce(constants.AddressZero);

      // Act
      const actualProject = (await sut['_getProject']('userId')) as UnclaimedGitProject;

      // Assert
      expect(actualProject.claimed).toBe(false);
      expect(actualProject.source).toBe(projectMetadata.source);
      expect(actualProject.owner).toBeUndefined();
      expect(actualProject.verificationStatus).toBe(VerificationStatus.NOT_STARTED);
      expect(actualProject.repoDriverAccount.driver).toBe('repo');
      expect(actualProject.repoDriverAccount.userId).toBe('userId');
    });

    it('should return the expected claimed project', async () => {
      // Arrange
      const ownerAddress = Wallet.createRandom().address;

      const repoAccount = {
        ownerAddress,
        status: 'claimed',
      } as unknown as RepoAccount;

      subgraphClientMock.repoDriverQueries.getRepoAccountById = vi
        .fn(subgraphClientMock.repoDriverQueries.getRepoAccountById)
        .mockResolvedValueOnce(repoAccount);

      const projectMetadata = {
        color: '#000000',
        description: 'description',
        emoji: 'emoji',
        source: {},
      } as unknown as z.infer<typeof repoDriverAccountMetadataSchema>;

      repoDriverMetadataManagerMock.fetchAccountMetadata.mockResolvedValueOnce({
        data: projectMetadata,
      });

      repoDriverClientMock.getOwner.mockResolvedValueOnce(ownerAddress);

      addressDriverClientMock.getUserIdByAddress.mockResolvedValueOnce('userId');

      // Act
      const actualProject = (await sut['_getProject']('userId')) as ClaimedGitProject;

      // Assert
      expect(actualProject.claimed).toBe(true);
      expect(actualProject.source).toBe(projectMetadata.source);
      expect(actualProject.repoDriverAccount.driver).toBe('repo');
      expect(actualProject.repoDriverAccount.userId).toBe('userId');
      expect(actualProject.owner.driver).toBe('address');
      expect(actualProject.owner.userId).toBe('userId');
      expect(actualProject.owner.address).toBe(ownerAddress);
    });
  });

  describe('_verifySubgraphAndOnChainStateIsInSync', () => {
    it('should throw if the project is claimed but the repo account is not', () => {
      // Arrange
      const repoAccount = {
        status: 'not-started',
      } as unknown as RepoAccount;

      const isClaimed = true;

      // Act & Assert
      expect(() =>
        sut['_verifySubgraphAndOnChainStateIsInSync'](isClaimed, repoAccount, 'userId'),
      ).toThrow();
    });

    it('should throw if the project is not claimed but the repo account is', () => {
      // Arrange
      const repoAccount = {
        status: 'claimed',
      } as unknown as RepoAccount;

      const isClaimed = false;

      // Act & Assert
      expect(() =>
        sut['_verifySubgraphAndOnChainStateIsInSync'](isClaimed, repoAccount, 'userId'),
      ).toThrow();
    });
  });

  describe('_calculateVerificationStatus', () => {
    it('should return the expected verification status if the repo account status is NOT_STARTED', () => {
      // Arrange
      const repoAccount = {
        status: 'not-started',
      } as unknown as RepoAccount;

      // Act
      const actualVerificationStatus = sut['_calculateVerificationStatus'](repoAccount);

      // Assert
      expect(actualVerificationStatus).toBe(VerificationStatus.NOT_STARTED);
    });

    it('should return the expected verification status if the repo account status is OWNER_UPDATE_REQUESTED and request is still in progress', () => {
      // Arrange
      const repoAccount = {
        status: 'owner-update-requested',
        lastUpdatedBlockTimestamp: new Date().getTime(),
      } as unknown as RepoAccount;

      // Act
      const actualVerificationStatus = sut['_calculateVerificationStatus'](repoAccount);

      // Assert
      expect(actualVerificationStatus).toBe(VerificationStatus.IN_PROGRESS);
    });

    it('should return the expected verification status if the repo account status is OWNER_UPDATE_REQUESTED and request has failed after 5 mins', () => {
      // Arrange
      const repoAccount = {
        status: 'owner-update-requested',
        lastUpdatedBlockTimestamp: new Date().getTime() - (new Date().getTime() - 1),
      } as unknown as RepoAccount;

      // Act
      const actualVerificationStatus = sut['_calculateVerificationStatus'](repoAccount);

      // Assert
      expect(actualVerificationStatus).toBe(VerificationStatus.FAILED);
    });

    it('should throw if the repo account status is CLAIMED', () => {
      // Arrange
      const repoAccount = {
        status: 'claimed',
        lastUpdatedBlockTimestamp: new Date().getTime() - (new Date().getTime() - 1),
      } as unknown as RepoAccount;

      // Act & Assert
      expect(() => sut['_calculateVerificationStatus'](repoAccount)).toThrow();
    });
  });
});
