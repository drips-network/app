/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AddressDriverClient,
  DripsSubgraphClient,
  NFTDriverClient,
  Utils,
  type NftSubAccount,
  NFTDriverTxFactory,
} from 'radicle-drips';
import DripListService from '../driplist/DripListService';
import type { z } from 'zod';
import {
  VerificationStatus,
  type ClaimedGitProject,
  type NFTDriverAccount,
  type UnclaimedGitProject,
} from '../metadata/types';
import type { DripsReceiverStruct } from 'radicle-drips';
import type {
  nftDriverAccountMetadataSchema,
  repoDriverSplitReceiverSchema,
} from '../metadata/schemas';
import type { PopulatedTransaction } from 'ethers';
import MetadataManagerBase from '../metadata/MetadataManagerBase';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

vi.mock('$lib/utils/get-drips-clients');
vi.mock('../metadata/NftDriverMetadataManager');
vi.mock('../metadata/RepoDriverMetadataManager');
vi.mock('../RepoDriverUtils');
vi.mock('.../project/GitProjectService');

describe('DripListService', () => {
  let subgraphClientMock: any;
  let nftDriverClientMock: any;
  let gitProjectManagerMock: any;
  let nftDriverTxFactoryMock: any;
  let addressDriverClientMock: any;
  let nftDriverMetadataManagerMock: any;
  let repoDriverMetadataManagerMock: any;

  beforeEach(async () => {
    const getClient = await import('$lib/utils/get-drips-clients');
    const GitProjectService = await import('../project/GitProjectService');
    const NftDriverMetadataManager = await import('../metadata/NftDriverMetadataManager');
    const RepoDriverMetadataManager = await import('../metadata/RepoDriverMetadataManager');

    subgraphClientMock = {
      getNftSubAccountsByOwner: vi.fn(DripsSubgraphClient.prototype.getNftSubAccountsByOwner),
      getCurrentDripsReceivers: vi.fn(DripsSubgraphClient.prototype.getCurrentDripsReceivers),
    };
    getClient.getSubgraphClient = vi.fn().mockImplementation(() => subgraphClientMock);

    addressDriverClientMock = {
      getUserIdByAddress: vi.fn(AddressDriverClient.prototype.getUserIdByAddress),
      signer: {
        getAddress: vi.fn(),
      },
      setDrips: vi.fn(AddressDriverClient.prototype.setDrips),
    };
    getClient.getAddressDriverClient = vi.fn().mockImplementation(() => addressDriverClientMock);

    nftDriverClientMock = {
      safeCreateAccountWithSalt: vi.fn(NFTDriverClient.prototype.safeCreateAccountWithSalt),
    };
    getClient.getNFTDriverClient = vi.fn().mockImplementation(() => nftDriverClientMock);

    nftDriverTxFactoryMock = {
      setSplits: vi.fn(NFTDriverTxFactory.prototype.setSplits),
      emitUserMetadata: vi.fn(NFTDriverTxFactory.prototype.emitUserMetadata),
    };
    getClient.getNFTDriverTxFactory = vi.fn().mockImplementation(() => nftDriverTxFactoryMock);

    nftDriverMetadataManagerMock = {
      fetchAccountMetadata: vi.fn(NftDriverMetadataManager.default.prototype.fetchAccountMetadata),
      fetchAccount: vi.fn(NftDriverMetadataManager.default.prototype.fetchAccount),
      buildAccountMetadata: vi.fn(NftDriverMetadataManager.default.prototype.buildAccountMetadata),
      pinAccountMetadata: vi.fn(NftDriverMetadataManager.default.prototype.pinAccountMetadata),
    };
    (NftDriverMetadataManager.default as any) = vi
      .fn()
      .mockImplementation(() => nftDriverMetadataManagerMock);

    repoDriverMetadataManagerMock = {
      fetchAccountMetadata: vi.fn(RepoDriverMetadataManager.default.prototype.fetchAccountMetadata),
    };
    (RepoDriverMetadataManager.default as any) = vi
      .fn()
      .mockImplementation(() => repoDriverMetadataManagerMock);

    gitProjectManagerMock = {
      getByUserId: vi.fn(GitProjectService.default.prototype.getByUserId),
    };
    (GitProjectService.default.new as any) = vi
      .fn()
      .mockImplementation(() => gitProjectManagerMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getByOwnerAddress', () => {
    it('should return an empty array if the owner has no DripLists', async () => {
      // Arrange
      const owner = '0x123';
      subgraphClientMock.getNftSubAccountsByOwner.mockResolvedValue([] as NftSubAccount[]);

      const dripListService = await DripListService.new();

      // Act
      const dripLists = await dripListService.getByOwnerAddress(owner);

      // Assert
      expect(dripLists).toEqual([]);
    });

    it("should return the owner's DripLists", async () => {
      // Arrange
      const owner = '0x123';
      const ownerNftSubAccounts: NftSubAccount[] = [
        {
          tokenId: '1',
          ownerAddress: owner,
        },
      ];

      subgraphClientMock.getNftSubAccountsByOwner.mockResolvedValue(ownerNftSubAccounts);

      const nftSubAccountMetadata: {
        hash: string;
        data: z.infer<typeof nftDriverAccountMetadataSchema>;
      }[] = [
        {
          data: {
            isDripList: true,
            projects: [
              {
                userId: 'tokenId1-1',
                weight: 1,
              },
            ],
          },
        },
      ] as unknown as {
        hash: string;
        data: z.infer<typeof nftDriverAccountMetadataSchema>;
      }[];

      nftDriverMetadataManagerMock.fetchAccountMetadata.mockResolvedValueOnce(
        nftSubAccountMetadata[0],
      );

      const dripListService = await DripListService.new();

      const originalGetDripListProjects = DripListService.prototype['_getDripListProjects'];

      dripListService['_getDripListProjects'] = vi
        .fn(DripListService.prototype['_getDripListProjects'])
        .mockResolvedValueOnce([
          {
            weight: nftSubAccountMetadata[0].data.projects[0].weight,
            project: {
              repoDriverAccount: {
                userId: nftSubAccountMetadata[0].data.projects[0].userId,
              },
            },
          } as any,
        ]);

      // Act
      const dripLists = await dripListService.getByOwnerAddress(owner);

      // Assert
      expect(dripLists).toHaveLength(1);
      expect(dripLists[0].projects).toHaveLength(1);
      expect(dripLists[0].projects[0].project.repoDriverAccount.userId).toBe(
        nftSubAccountMetadata[0].data.projects[0].userId,
      );
      expect(dripLists[0].projects[0].weight).toBe(
        nftSubAccountMetadata[0].data.projects[0].weight,
      );
      expect(nftDriverMetadataManagerMock.fetchAccountMetadata).toHaveBeenCalledTimes(1);
      expect(subgraphClientMock.getNftSubAccountsByOwner).toHaveBeenCalledTimes(1);
      expect(dripListService['_getDripListProjects']).toHaveBeenCalledTimes(1);

      DripListService.prototype['_getDripListProjects'] = originalGetDripListProjects;
    });

    it('should throw when the user has more than one DripList', async () => {
      // Arrange
      const owner = '0x123';
      const ownerNftSubAccounts: NftSubAccount[] = [
        {
          tokenId: '1',
          ownerAddress: owner,
        },
        {
          tokenId: '2',
          ownerAddress: owner,
        },
      ];

      subgraphClientMock.getNftSubAccountsByOwner.mockResolvedValue(ownerNftSubAccounts);

      const nftSubAccountMetadata: {
        hash: string;
        data: z.infer<typeof nftDriverAccountMetadataSchema>;
      }[] = [
        {
          data: {
            isDripList: true,
            projects: [
              {
                userId: 'tokenId1-1',
                weight: 1,
              },
            ],
          },
        },
        {
          data: {
            isDripList: true,
            projects: [
              {
                userId: 'tokenId2-1',
                weight: 1,
              },
            ],
          },
        },
      ] as unknown as {
        hash: string;
        data: z.infer<typeof nftDriverAccountMetadataSchema>;
      }[];

      nftDriverMetadataManagerMock.fetchAccountMetadata
        .mockResolvedValueOnce(nftSubAccountMetadata[0])
        .mockResolvedValueOnce(nftSubAccountMetadata[1]);

      const dripListService = await DripListService.new();

      const originalGetDripListProjects = DripListService.prototype['_getDripListProjects'];

      dripListService['_getDripListProjects'] = vi
        .fn(DripListService.prototype['_getDripListProjects'])
        .mockResolvedValueOnce([
          {
            weight: nftSubAccountMetadata[0].data.projects[0].weight,
            project: {
              repoDriverAccount: {
                userId: nftSubAccountMetadata[0].data.projects[0].userId,
              },
            },
          } as any,
        ])
        .mockResolvedValueOnce([
          {
            weight: nftSubAccountMetadata[1].data.projects[0].weight,
            project: {
              repoDriverAccount: {
                userId: nftSubAccountMetadata[1].data.projects[0].userId,
              },
            },
          } as any,
        ]);

      // Act & Assert
      await expect(dripListService.getByOwnerAddress(owner)).rejects.toThrow();

      DripListService.prototype['_getDripListProjects'] = originalGetDripListProjects;
    });
  });

  describe('_getDripListProjects', () => {
    it('should return the expected unclaimed project', async () => {
      // Arrange
      subgraphClientMock.getNftSubAccountsByOwner.mockResolvedValue([] as NftSubAccount[]);

      const projectMetadata = {
        data: {
          source: {
            repoName: 'repoName',
            url: 'url',
          },
        },
      };
      repoDriverMetadataManagerMock.fetchAccountMetadata.mockResolvedValueOnce(
        projectMetadata as any,
      );

      const projects: z.infer<typeof repoDriverSplitReceiverSchema>[] = [
        {
          weight: 1,
          userId: '1',
          source: {
            forge: 'generic',
            repoName: 'repoName',
            url: 'url',
          },
        },
      ];

      const expectedProject = {
        verificationStatus: VerificationStatus.NOT_STARTED,
        claimed: false,
        owner: undefined,
        repoDriverAccount: {
          driver: 'repo',
          userId: '1',
        },
        source: {
          forge: 'generic',
          repoName: 'repoName',
          url: 'url',
        },
      } as UnclaimedGitProject;
      gitProjectManagerMock.getByUserId.mockResolvedValueOnce(expectedProject);

      const dripListService = await DripListService.new();

      // Act
      const result = await dripListService['_getDripListProjects'](projects);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].weight).toBe(1);
      expect(result[0].project.repoDriverAccount.userId).toBe('1');
      expect(result[0].project.source.repoName).toBe('repoName');
      expect(result[0].project.source.url).toBe('url');
      expect(result[0].project.source.forge).toBe('generic');
      expect(result[0].project.claimed).toBe(false);
    });

    it('should return the expected claimed project', async () => {
      // Arrange
      const owner = '0x123';
      subgraphClientMock.getNftSubAccountsByOwner.mockResolvedValue([] as NftSubAccount[]);

      const projectMetadata = {
        data: {
          source: {
            repoName: 'repoName',
            url: 'url',
          },
          color: 'color',
          description: 'description',
          emoji: 'emoji',
        },
      };
      repoDriverMetadataManagerMock.fetchAccountMetadata.mockResolvedValueOnce(
        projectMetadata as any,
      );

      const projects: z.infer<typeof repoDriverSplitReceiverSchema>[] = [
        {
          weight: 1,
          userId: '1',
          source: {
            forge: 'generic',
            repoName: 'repoName',
            url: 'url',
          },
        },
      ];

      addressDriverClientMock.getUserIdByAddress.mockResolvedValueOnce('111');

      const expectedProject = {
        claimed: true,
        owner: {
          driver: 'address',
          userId: '111',
          address: owner,
        },
        source: {
          forge: 'generic',
          repoName: 'repoName',
          url: 'url',
        },
        color: 'color',
        description: 'description',
        emoji: 'emoji',
      } as ClaimedGitProject;
      gitProjectManagerMock.getByUserId.mockResolvedValueOnce(expectedProject);

      const dripListService = await DripListService.new();

      // Act
      const result = await dripListService['_getDripListProjects'](projects);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].weight).toBe(1);
      expect(result[0].project.source.repoName).toBe('repoName');
      expect(result[0].project.source.url).toBe('url');
      expect(result[0].project.source.forge).toBe('generic');
      expect(result[0].project.claimed).toBe(true);
      expect(result[0].project.owner?.address).toBe(owner);
      expect(result[0].project.owner?.userId).toBe('111');
      expect(result[0].project.owner?.driver).toBe('address');
      expect((result[0].project as ClaimedGitProject).color).toBe('color');
      expect((result[0].project as ClaimedGitProject).description).toBe('description');
      expect((result[0].project as ClaimedGitProject).emoji).toBe('emoji');
    });
  });

  describe('create', () => {
    it('should throw if the user already has a drip list', async () => {
      // Arrange
      const dripListService = await DripListService.new();

      dripListService.getByOwnerAddress = vi
        .fn(dripListService.getByOwnerAddress)
        .mockResolvedValue([{}, {}] as any);

      // Act & Assert
      await expect(dripListService.create(1, '0x123')).rejects.toThrow();
    });

    it('should return the new DripList token ID', async () => {
      // Arrange
      const dripListService = await DripListService.new();

      nftDriverClientMock.safeCreateAccountWithSalt.mockResolvedValueOnce('1');

      dripListService.getByOwnerAddress = vi
        .fn(dripListService.getByOwnerAddress)
        .mockResolvedValue([] as any);

      // Act
      const result = await dripListService.create(1, '0x123');

      // Assert
      expect(result).toBe('1');
    });
  });

  describe('setStream', () => {
    it('should set the expected stream', async () => {
      // Arrange
      const dripListId = '1';
      const tokenAddress = '0x123';
      const config = Utils.DripsReceiverConfiguration.fromUint256(
        Utils.DripsReceiverConfiguration.toUint256({
          dripId: 1n,
          start: 1n,
          duration: 2n,
          amountPerSec: 3n,
        }),
      );
      const balanceDelta = 1n;

      const currentReceivers: DripsReceiverStruct[] = [];

      subgraphClientMock.getCurrentDripsReceivers.mockResolvedValueOnce(currentReceivers);

      addressDriverClientMock.signer.getAddress.mockResolvedValueOnce('0x234');

      addressDriverClientMock.setDrips = vi.fn();

      const dripListService = await DripListService.new();

      // Act
      await dripListService.setStream(dripListId, tokenAddress, config, balanceDelta);

      // Assert
      expect(addressDriverClientMock.setDrips).toHaveBeenCalledWith(
        tokenAddress,
        currentReceivers,
        expect.arrayContaining([
          expect.objectContaining({
            userId: dripListId,
            config: Utils.DripsReceiverConfiguration.toUint256(config),
          }),
        ]),
        '0x234',
        balanceDelta,
      );
    });
  });

  describe('buildSetSplitsBatchTx', () => {
    it('should throw when the drip list does not exist', async () => {
      // Arrange
      nftDriverMetadataManagerMock.fetchAccount.mockResolvedValueOnce(null);

      const dripListService = await DripListService.new();

      // Act & Assert
      await expect(dripListService.buildSetSplitsBatchTx('1', [])).rejects.toThrow();
    });

    it('should return the expected preset', async () => {
      // Arrange
      const dripListId = '1';
      const projects: z.infer<typeof repoDriverSplitReceiverSchema>[] = [
        {
          weight: 1,
          userId: '1',
        },
      ] as unknown as z.infer<typeof repoDriverSplitReceiverSchema>[];

      const forAccount = {} as unknown as NFTDriverAccount;
      nftDriverMetadataManagerMock.fetchAccount.mockResolvedValueOnce(forAccount);

      const dripListMetadata = {} as unknown as z.infer<typeof nftDriverAccountMetadataSchema>;
      nftDriverMetadataManagerMock.buildAccountMetadata.mockReturnValue(dripListMetadata);

      const hash = '0x123';
      nftDriverMetadataManagerMock.pinAccountMetadata.mockResolvedValueOnce(hash);

      const setSplitsTx = {} as unknown as PopulatedTransaction;
      nftDriverTxFactoryMock.setSplits.mockResolvedValueOnce(setSplitsTx);

      const emitMetadataTx = {} as unknown as PopulatedTransaction;
      nftDriverTxFactoryMock.emitUserMetadata.mockResolvedValueOnce(emitMetadataTx);

      const dripListService = await DripListService.new();

      // Act
      const result = await dripListService.buildSetSplitsBatchTx(dripListId, projects);

      // Assert
      expect(result).toEqual([setSplitsTx, emitMetadataTx]);
      expect(nftDriverMetadataManagerMock.fetchAccount).toHaveBeenCalledWith(dripListId);
      expect(nftDriverMetadataManagerMock.buildAccountMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          forAccount,
          projects,
        }),
      );
      expect(nftDriverMetadataManagerMock.pinAccountMetadata).toHaveBeenCalledWith(
        dripListMetadata,
      );
      expect(nftDriverTxFactoryMock.setSplits).toHaveBeenCalledWith(
        dripListId,
        expect.arrayContaining([
          expect.objectContaining({
            userId: projects[0].userId,
            weight: projects[0].weight,
          }),
        ]),
      );
      expect(nftDriverTxFactoryMock.emitUserMetadata).toHaveBeenCalledWith(
        dripListId,
        expect.arrayContaining([
          expect.objectContaining(
            Utils.Metadata.createFromStrings(MetadataManagerBase.USER_METADATA_KEY, hash),
          ),
        ]),
      );
    });
  });
});
