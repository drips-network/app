/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AddressDriverClient,
  DripsSubgraphClient,
  NFTDriverClient,
  type NftSubAccount,
  NFTDriverTxFactory,
  RepoDriverClient,
  CallerClient,
  AddressDriverTxFactory,
  ERC20TxFactory,
} from 'radicle-drips';
import DripListService from '../driplist/DripListService';
import type { State } from '../../../routes/app/(wallet-required)/(flows)/funder-onboarding/funder-onboarding-flow';
import { BigNumber, type PopulatedTransaction } from 'ethers';
import type { z } from 'zod';
import type {
  nftDriverAccountMetadataSchema,
  repoDriverSplitReceiverSchema,
} from '../metadata/schemas';
import {
  VerificationStatus,
  type ClaimedGitProject,
  type UnclaimedGitProject,
} from '../metadata/types';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

vi.mock('$lib/stores/wallet/wallet.store');
vi.mock('$lib/utils/get-drips-clients');
vi.mock('../metadata/NftDriverMetadataManager');
vi.mock('../metadata/RepoDriverMetadataManager');
vi.mock('../RepoDriverUtils');
vi.mock('.../project/GitProjectService');

describe('DripListService', () => {
  let subgraphClientMock: any;
  let nftDriverClientMock: any;
  let repoDriverClientMock: any;
  let gitProjectManagerMock: any;
  let callerDriverClientMock: any;
  let nftDriverTxFactoryMock: any;
  let addressDriverTxFactoryMock: any;
  let addressDriverClientMock: any;
  let nftDriverMetadataManagerMock: any;
  let repoDriverMetadataManagerMock: any;
  let originalPublishMetadataToIpfs: any;
  let originalBuildCreateDripListTx: any;
  let originalBuildTokenApprovalTx: any;
  let originalBuildSetDripListStreamTxs: any;
  let originalGetApprovalFlowTxs: any;
  let originalGetNormalFlowTxs: any;
  let originalGetDripListProjects: any;
  let erc20DriverTxFactoryMock: any;

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

    callerDriverClientMock = {
      populateCallBatchedTx: vi.fn(CallerClient.prototype.populateCallBatchedTx),
      signer: {
        estimateGas: vi.fn(),
      },
    };
    getClient.getCallerClient = vi.fn().mockImplementation(() => callerDriverClientMock);

    addressDriverClientMock = {
      getUserIdByAddress: vi.fn(AddressDriverClient.prototype.getUserIdByAddress),
      signer: {
        getAddress: vi.fn(),
      },
      setDrips: vi.fn(AddressDriverClient.prototype.setDrips),
      getAllowance: vi.fn(AddressDriverClient.prototype.setDrips),
    };
    getClient.getAddressDriverClient = vi.fn().mockImplementation(() => addressDriverClientMock);

    nftDriverClientMock = {
      calcTokenIdWithSalt: vi.fn(NFTDriverClient.prototype.calcTokenIdWithSalt),
      safeCreateAccountWithSalt: vi.fn(NFTDriverClient.prototype.safeCreateAccountWithSalt),
    };
    getClient.getNFTDriverClient = vi.fn().mockImplementation(() => nftDriverClientMock);

    repoDriverClientMock = {
      getUserId: vi.fn(RepoDriverClient.prototype.getUserId),
    };
    getClient.getRepoDriverClient = vi.fn().mockImplementation(() => repoDriverClientMock);

    nftDriverTxFactoryMock = {
      setSplits: vi.fn(NFTDriverTxFactory.prototype.setSplits),
      emitUserMetadata: vi.fn(NFTDriverTxFactory.prototype.emitUserMetadata),
    };
    getClient.getNFTDriverTxFactory = vi.fn().mockImplementation(() => nftDriverTxFactoryMock);

    addressDriverTxFactoryMock = {
      setDrips: vi.fn(AddressDriverTxFactory.prototype.setDrips),
    };
    getClient.getAddressDriverTxFactory = vi
      .fn()
      .mockImplementation(() => addressDriverTxFactoryMock);

    erc20DriverTxFactoryMock = {
      approve: vi.fn(ERC20TxFactory.prototype.approve),
    };
    ERC20TxFactory.create = vi.fn().mockImplementation(() => erc20DriverTxFactoryMock);

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

    originalPublishMetadataToIpfs = DripListService.prototype['_publishMetadataToIpfs'];
    originalBuildCreateDripListTx = DripListService.prototype['_buildCreateDripListTx'];
    originalBuildTokenApprovalTx = DripListService.prototype['_buildTokenApprovalTx'];
    originalBuildSetDripListStreamTxs = DripListService.prototype['_buildSetDripListStreamTxs'];
    originalGetApprovalFlowTxs = DripListService.prototype['_getApprovalFlowTxs'];
    originalGetNormalFlowTxs = DripListService.prototype['_getNormalFlowTxs'];
    originalGetDripListProjects = DripListService.prototype['_getDripListProjects'];
  });

  afterEach(() => {
    vi.restoreAllMocks();

    DripListService.prototype['_publishMetadataToIpfs'] = originalPublishMetadataToIpfs;
    DripListService.prototype['_buildCreateDripListTx'] = originalBuildCreateDripListTx;
    DripListService.prototype['_buildTokenApprovalTx'] = originalBuildTokenApprovalTx;
    DripListService.prototype['_buildSetDripListStreamTxs'] = originalBuildSetDripListStreamTxs;
    DripListService.prototype['_getApprovalFlowTxs'] = originalGetApprovalFlowTxs;
    DripListService.prototype['_getNormalFlowTxs'] = originalGetNormalFlowTxs;
    DripListService.prototype['_getDripListProjects'] = originalGetDripListProjects;
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

      dripListService['_getDripListProjects'] = vi
        .fn(dripListService['_getDripListProjects'])
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
            ownerName: 'test',
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
            forge: 'github',
            ownerName: 'test',
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
          forge: 'github',
          repoName: 'repoName',
          ownerName: 'test',
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
      expect(result[0].project.source.forge).toBe('github');
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
            forge: 'github',
            repoName: 'repoName',
            ownerName: 'test',
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
          forge: 'github',
          repoName: 'repoName',
          ownerName: 'test',
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
      expect(result[0].project.source.forge).toBe('github');
      expect(result[0].project.claimed).toBe(true);
      expect(result[0].project.owner?.address).toBe(owner);
      expect(result[0].project.owner?.userId).toBe('111');
      expect(result[0].project.owner?.driver).toBe('address');
      expect((result[0].project as ClaimedGitProject).color).toBe('color');
      expect((result[0].project as ClaimedGitProject).description).toBe('description');
      expect((result[0].project as ClaimedGitProject).emoji).toBe('emoji');
    });
  });

  describe('buildTransactContext', () => {
    it('should return the expected context', async () => {
      // Arrange
      const state = {
        supportConfig: {
          listSelected: ['0x0000000'],
          streamRateValueParsed: BigInt(1000),
          topUpAmountValueParsed: BigInt(2000),
        },
        dripList: {
          title: 'title',
          percentages: {
            'https://github.com/jtourkos/git-dep-url': 100,
          },
        },
      } as unknown as State;

      const repoDriverUserId = '1';
      repoDriverClientMock.getUserId.mockResolvedValueOnce(repoDriverUserId);

      const dripListId = '1000';
      const listOwner = '0x123';

      const ownerNftSubAccounts: NftSubAccount[] = [
        {
          tokenId: dripListId,
          ownerAddress: listOwner,
        },
      ];

      subgraphClientMock.getNftSubAccountsByOwner.mockResolvedValue(ownerNftSubAccounts);

      nftDriverClientMock.calcTokenIdWithSalt.mockResolvedValueOnce(dripListId);

      const ipfsHash = 'ipfsHash';

      const sut = await DripListService.new();

      sut['_publishMetadataToIpfs'] = vi
        .fn(DripListService.prototype['_publishMetadataToIpfs'])
        .mockResolvedValueOnce(ipfsHash);

      const createDripListTx = {} as unknown as PopulatedTransaction;
      sut['_buildCreateDripListTx'] = vi
        .fn(DripListService.prototype['_buildCreateDripListTx'])
        .mockResolvedValueOnce(createDripListTx);

      const tokenApprovalTx = {} as unknown as PopulatedTransaction;
      sut['_buildTokenApprovalTx'] = vi
        .fn(DripListService.prototype['_buildTokenApprovalTx'])
        .mockResolvedValueOnce(tokenApprovalTx);

      const setDripListProjectsTx = {} as unknown as PopulatedTransaction;
      nftDriverTxFactoryMock.setSplits.mockResolvedValueOnce(setDripListProjectsTx);

      const setStreamTx = {} as unknown as PopulatedTransaction;
      sut['_buildSetDripListStreamTxs'] = vi
        .fn(DripListService.prototype['_buildSetDripListStreamTxs'])
        .mockResolvedValueOnce(setStreamTx);

      const allowance = BigInt(100);
      addressDriverClientMock.getAllowance.mockResolvedValueOnce(allowance);

      const approvalFlowTxs = {} as any;
      sut['_getApprovalFlowTxs'] = vi
        .fn(DripListService.prototype['_getApprovalFlowTxs'])
        .mockResolvedValueOnce(approvalFlowTxs);

      const normalFlowTxs = {} as any;
      sut['_getNormalFlowTxs'] = vi
        .fn(DripListService.prototype['_getNormalFlowTxs'])
        .mockResolvedValueOnce(normalFlowTxs);

      // Act
      const transactContext = await sut.buildTransactContext(state);

      // Assert
      expect(transactContext.approvalFlowTxs).toBe(approvalFlowTxs);
      expect(transactContext.normalFlowTxs).toBe(normalFlowTxs);
      expect(transactContext.dripListId).toBe(dripListId);
      expect(transactContext.callerClient).toBe(callerDriverClientMock);
      expect(transactContext.needsApproval).toBe(true);
    });
  });

  describe('_getApprovalFlowTxs', async () => {
    it('should return the expected result when it does not need approval', async () => {
      // Arrange
      const sut = await DripListService.new();
      const txs: { [name: string]: PopulatedTransaction } = {
        tokenApprovalTx: {},
      };

      const batchTx = {} as unknown as PopulatedTransaction;
      callerDriverClientMock.populateCallBatchedTx.mockResolvedValueOnce(batchTx);
      callerDriverClientMock.signer.estimateGas.mockResolvedValueOnce(BigNumber.from(1000));

      // Act
      const approvalFlowTxs = await sut['_getApprovalFlowTxs'](txs, false, callerDriverClientMock);

      // Assert
      expect(approvalFlowTxs[0].transaction).toBe(txs.tokenApprovalTx);
      expect(approvalFlowTxs[1].transaction).toBe(batchTx);
      expect(approvalFlowTxs[1].transaction.gasLimit?.toNumber()).toBe(2000);
    });

    it('should return the expected result when it does need approval', async () => {
      // Arrange
      const sut = await DripListService.new();
      const txs: { [name: string]: PopulatedTransaction } = {
        tokenApprovalTx: {},
      };

      const batchTx = {} as unknown as PopulatedTransaction;
      callerDriverClientMock.populateCallBatchedTx.mockResolvedValueOnce(batchTx);

      // Act
      const approvalFlowTxs = await sut['_getApprovalFlowTxs'](txs, true, callerDriverClientMock);

      // Assert
      expect(approvalFlowTxs[0].transaction).toBe(txs.tokenApprovalTx);
      expect(approvalFlowTxs[1].transaction).toBe(batchTx);
      expect(approvalFlowTxs[1].transaction.gasLimit?.toNumber()).toBe(
        BigNumber.from('0x0a05b6').toNumber(),
      );
    });
  });

  describe('_getNormalFlowTxs', async () => {
    it('should return the expected result when it does not need approval', async () => {
      // Arrange
      const sut = await DripListService.new();
      const txs: { [name: string]: PopulatedTransaction } = {
        createDripListTx: {},
        setDripListProjectsTx: {},
        setStreamTx: {},
      };

      const batchTx = {} as unknown as PopulatedTransaction;
      callerDriverClientMock.populateCallBatchedTx.mockResolvedValueOnce(batchTx);
      callerDriverClientMock.signer.estimateGas.mockResolvedValueOnce(BigNumber.from(1000));

      // Act
      const normalFlowTxs = await sut['_getNormalFlowTxs'](txs, false, callerDriverClientMock);

      // Assert
      expect(normalFlowTxs.txs[0]).toBe(txs.createDripListTx);
      expect(normalFlowTxs.txs[1]).toBe(txs.setDripListProjectsTx);
      expect(normalFlowTxs.txs[2]).toBe(txs.setStreamTx);
      expect(normalFlowTxs.gasLimitWithBuffer?.toNumber()).toBe(2000);
    });

    it('should return the expected result when it does need approval', async () => {
      // Arrange
      const sut = await DripListService.new();
      const txs: { [name: string]: PopulatedTransaction } = {
        createDripListTx: {},
        setDripListProjectsTx: {},
        setStreamTx: {},
      };

      const batchTx = {} as unknown as PopulatedTransaction;
      callerDriverClientMock.populateCallBatchedTx.mockResolvedValueOnce(batchTx);
      callerDriverClientMock.signer.estimateGas.mockResolvedValueOnce(BigNumber.from(1000));

      // Act
      const normalFlowTxs = await sut['_getNormalFlowTxs'](txs, true, callerDriverClientMock);

      // Assert
      expect(normalFlowTxs.txs[0]).toBe(txs.createDripListTx);
      expect(normalFlowTxs.txs[1]).toBe(txs.setDripListProjectsTx);
      expect(normalFlowTxs.txs[2]).toBe(txs.setStreamTx);
      expect(normalFlowTxs.gasLimitWithBuffer).toBeUndefined();
    });
  });

  describe('_publishMetadataToIpfs', () => {
    it('should publish to IPFS and return the hash', async () => {
      // Arrange
      const sut = await DripListService.new();

      nftDriverMetadataManagerMock.pinAccountMetadata.mockResolvedValueOnce('hash');

      // Act
      const hash = await sut['_publishMetadataToIpfs']('1', []);

      // Assert
      expect(hash).toBe('hash');
    });
  });

  describe('_buildSetDripListStreamTxs', () => {
    it('should return the expected transaction', async () => {
      // Arrange
      const sut = await DripListService.new();
      const salt = BigInt(1);
      const token = '0x000';
      const dripListId = '1';
      const topUpAmount = BigInt(100);
      const start = BigInt(100);
      const duration = BigInt(100);
      const amountPerSecond = BigInt(100);
      const ownerAddressDriverUserId = '1';

      addressDriverClientMock.signer.getAddress.mockResolvedValueOnce('0x000');
      addressDriverClientMock.getUserIdByAddress.mockResolvedValueOnce(ownerAddressDriverUserId);

      const setStreamTx = {} as unknown as PopulatedTransaction;
      addressDriverTxFactoryMock.setDrips.mockResolvedValue(setStreamTx);

      subgraphClientMock.getCurrentDripsReceivers.mockResolvedValueOnce([]);

      // Act
      const result = await sut['_buildSetDripListStreamTxs'](
        salt,
        token,
        dripListId,
        topUpAmount,
        start,
        duration,
        amountPerSecond,
      );

      // Assert
      expect(result).toBe(setStreamTx);
    });
  });

  describe('_buildTokenApprovalTx', () => {
    it('should return the expected transaction', async () => {
      // Arrange
      const sut = await DripListService.new();

      const tokenApprovalTx = {} as unknown as PopulatedTransaction;
      erc20DriverTxFactoryMock.approve.mockResolvedValueOnce(tokenApprovalTx);

      // Act
      const result = await sut['_buildTokenApprovalTx']('0x000');

      // Assert
      expect(result).toBe(tokenApprovalTx);
    });
  });
});
