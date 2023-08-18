/* eslint-disable @typescript-eslint/no-explicit-any */
import * as getClient from '$lib/utils/get-drips-clients';
import RepoDriverMetadataManager from '$lib/utils/metadata/RepoDriverMetadataManager';
import type { repoDriverAccountMetadataParser } from '$lib/utils/metadata/schemas';
import {
  VerificationStatus,
  type UnclaimedGitProject,
  type ClaimedGitProject,
} from '$lib/utils/metadata/types';
import type { GitProject } from '$lib/utils/metadata/types';
import type { LatestVersion } from '$lib/utils/metadata/versioned-metadata';
import GitProjectService from '$lib/utils/project/GitProjectService';
import { Wallet } from 'ethers';
import { AddressDriverClient, RepoDriverClient, type RepoAccount } from 'radicle-drips';

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
      getAccountIdByAddress: vi.fn(AddressDriverClient.prototype.getAccountIdByAddress),
    };
    (getClient.getAddressDriverClient as any) = vi
      .fn()
      .mockImplementation(() => addressDriverClientMock);

    repoDriverClientMock = {
      getOwner: vi.fn(RepoDriverClient.prototype.getOwner),
      getAccountId: vi.fn(RepoDriverClient.prototype.getAccountId),
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

  describe('getByUrl', () => {
    it('should return the expected project', async () => {
      // Arrange
      const accountId = 'accountId';
      repoDriverClientMock.getAccountId.mockResolvedValueOnce(accountId);

      const originalGetDripListProjects = sut['getByAccountId'];

      const expectedProject = {} as unknown as GitProject;

      sut['getByAccountId'] = vi.fn(sut['getByAccountId']).mockResolvedValueOnce(expectedProject);

      // Act
      const actualProject = await sut.getByUrl('https://github.com/jtourkos/git-dep-url');

      // Assert
      expect(actualProject).toBe(expectedProject);
      expect(sut['getByAccountId']).toHaveBeenCalledWith(accountId, true);

      sut['getByAccountId'] = originalGetDripListProjects;
    });
  });

  describe('getByAccountId', () => {
    it('should return null if the repo account is not found', async () => {
      // Arrange
      subgraphClientMock.repoDriverQueries.getRepoAccountById = vi
        .fn(subgraphClientMock.repoDriverQueries.getRepoAccountById)
        .mockResolvedValueOnce(null);

      // Act
      const actualProject = await sut['getByAccountId']('accountId');

      // Assert
      expect(actualProject).toBeNull();
    });

    it('should return the expected unclaimed project', async () => {
      // Arrange
      const repoAccount: RepoAccount = {
        status: null,
        forge: BigInt(0),
        name: 'jtourkos/git-dep-url',
        ownerAddress: null,
        accountId: 'accountId',
        lastUpdatedBlockTimestamp: BigInt(Date.now()),
      };

      subgraphClientMock.repoDriverQueries.getRepoAccountById = vi
        .fn(subgraphClientMock.repoDriverQueries.getRepoAccountById)
        .mockResolvedValueOnce(repoAccount);

      const projectMetadata = {
        color: '#000000',
        description: 'description',
        emoji: 'emoji',
        source: {},
      } as unknown as LatestVersion<typeof repoDriverAccountMetadataParser>;

      repoDriverMetadataManagerMock.fetchAccountMetadata.mockResolvedValueOnce({
        data: projectMetadata,
      });

      repoDriverClientMock.getOwner.mockResolvedValueOnce(null);

      // Act
      const actualProject = (await sut['getByAccountId']('accountId')) as UnclaimedGitProject;

      // Assert
      expect(actualProject.claimed).toBe(false);
      expect(actualProject.source.url).toBe(
        GitProjectService.populateSource(Number(repoAccount.forge), 'git-dep-url', 'jtourkos').url,
      );
      expect(actualProject.owner).toBeUndefined();
      expect(actualProject.verificationStatus).toBe(VerificationStatus.NOT_STARTED);
      expect(actualProject.repoDriverAccount.driver).toBe('repo');
      expect(actualProject.repoDriverAccount.accountId).toBe('accountId');
    });

    it('should return the expected claimed project', async () => {
      // Arrange
      const ownerAddress = Wallet.createRandom().address;

      const repoAccount: RepoAccount = {
        status: 'CLAIMED',
        forge: BigInt(0),
        name: 'jtourkos/git-dep-url',
        ownerAddress,
        accountId: 'accountId',
        lastUpdatedBlockTimestamp: BigInt(Date.now()),
      };

      subgraphClientMock.repoDriverQueries.getRepoAccountById = vi
        .fn(subgraphClientMock.repoDriverQueries.getRepoAccountById)
        .mockResolvedValueOnce(repoAccount);

      const projectMetadata = {
        color: '#000000',
        description: 'description',
        emoji: 'emoji',
        source: {},
        splits: {
          maintainers: [
            {
              weight: 500000,
              accountId: '875267609686611184008791658115888920329297355417',
            },
          ],
          dependencies: [
            {
              weight: 500000,
              accountId: '1235',
              source: {
                forge: 'github',
                repoName: 'foo',
                ownerName: 'bar',
                url: 'https://foo.bar/',
              },
            },
          ],
        },
      } as unknown as LatestVersion<typeof repoDriverAccountMetadataParser>;

      repoDriverMetadataManagerMock.fetchAccountMetadata.mockResolvedValueOnce({
        data: projectMetadata,
      });

      repoDriverClientMock.getOwner.mockResolvedValueOnce(ownerAddress);

      addressDriverClientMock.getAccountIdByAddress.mockResolvedValueOnce('accountId');

      // Act
      const actualProject = (await sut['getByAccountId']('accountId')) as ClaimedGitProject;

      // Assert
      expect(actualProject.claimed).toBe(true);
      expect(actualProject.source).toBe(projectMetadata.source);
      expect(actualProject.repoDriverAccount.driver).toBe('repo');
      expect(actualProject.repoDriverAccount.accountId).toBe('accountId');
      expect(actualProject.owner.driver).toBe('address');
      expect(actualProject.owner.accountId).toBe('accountId');
      expect(actualProject.owner.address).toBe(ownerAddress);
      expect(actualProject.splits.maintainers).toStrictEqual([
        {
          type: 'address',
          weight: 500000,
          account: {
            address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
            driver: 'address',
            accountId: '875267609686611184008791658115888920329297355417',
          },
        },
      ]);
      expect(actualProject.splits.dependencies).toStrictEqual([
        {
          type: 'repo',
          weight: 500000,
          account: {
            driver: 'repo',
            accountId: '1235',
          },
          source: {
            forge: 'github',
            repoName: 'foo',
            ownerName: 'bar',
            url: 'https://foo.bar/',
          },
        },
      ]);
    });
  });

  describe('_verifySubgraphAndOnChainStateIsInSync', () => {
    it('should throw if the project is claimed but the repo account is not', () => {
      // Arrange
      const repoAccount = {
        status: 'NOT_STARTED',
      } as unknown as RepoAccount;

      const isClaimed = true;

      // Act & Assert
      expect(() =>
        sut['_verifySubgraphAndOnChainStateIsInSync'](isClaimed, repoAccount, 'accountId'),
      ).toThrow();
    });

    it('should throw if the project is not claimed but the repo account is', () => {
      // Arrange
      const repoAccount = {
        status: 'CLAIMED',
      } as unknown as RepoAccount;

      const isClaimed = false;

      // Act & Assert
      expect(() =>
        sut['_verifySubgraphAndOnChainStateIsInSync'](isClaimed, repoAccount, 'accountId'),
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
        lastUpdatedBlockTimestamp: BigInt(new Date().getTime()),
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
        lastUpdatedBlockTimestamp:
          BigInt(new Date().getTime()) - (BigInt(new Date().getTime()) - 1n),
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
