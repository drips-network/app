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
import type { State } from '../../../routes/app/(flows)/funder-onboarding/funder-onboarding-flow';
import { BigNumber, type PopulatedTransaction } from 'ethers';
import type { z } from 'zod';
import type { nftDriverAccountMetadataSchema } from '../metadata/schemas';

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
  let originalBuildSetStreamListStreamTxs: any;
  let originalGetApprovalFlowTxs: any;
  let originalGetNormalFlowTxs: any;
  let erc20DriverTxFactoryMock: any;

  beforeEach(async () => {
    const getClient = await import('$lib/utils/get-drips-clients');
    const GitProjectService = await import('../project/GitProjectService');
    const NftDriverMetadataManager = await import('../metadata/NftDriverMetadataManager');
    const RepoDriverMetadataManager = await import('../metadata/RepoDriverMetadataManager');

    subgraphClientMock = {
      getNftSubAccountsByOwner: vi.fn(DripsSubgraphClient.prototype.getNftSubAccountsByOwner),
      getCurrentStreamsReceivers: vi.fn(DripsSubgraphClient.prototype.getCurrentStreamsReceivers),
    };
    addressDriverClientMock = {
      getUserIdByAddress: vi.fn(AddressDriverClient.prototype.getUserIdByAddress),
    };
    getClient.getSubgraphClient = vi.fn().mockImplementation(() => subgraphClientMock);
    getClient.getAddressDriverClient = vi.fn().mockImplementation(() => addressDriverClientMock);

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
      setStreams: vi.fn(AddressDriverClient.prototype.setStreams),
      getAllowance: vi.fn(AddressDriverClient.prototype.setStreams),
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
      setStreams: vi.fn(AddressDriverTxFactory.prototype.setStreams),
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
    originalBuildSetStreamListStreamTxs = DripListService.prototype['_buildSetStreamListStreamTxs'];
    originalGetApprovalFlowTxs = DripListService.prototype['_getApprovalFlowTxs'];
    originalGetNormalFlowTxs = DripListService.prototype['_getNormalFlowTxs'];
  });

  afterEach(() => {
    vi.restoreAllMocks();

    DripListService.prototype['_publishMetadataToIpfs'] = originalPublishMetadataToIpfs;
    DripListService.prototype['_buildCreateDripListTx'] = originalBuildCreateDripListTx;
    DripListService.prototype['_buildTokenApprovalTx'] = originalBuildTokenApprovalTx;
    DripListService.prototype['_buildSetStreamListStreamTxs'] = originalBuildSetStreamListStreamTxs;
    DripListService.prototype['_getApprovalFlowTxs'] = originalGetApprovalFlowTxs;
    DripListService.prototype['_getNormalFlowTxs'] = originalGetNormalFlowTxs;
  });

  describe('getByOwnerAddress', () => {
    it('should return an empty array if the owner has no DripLists', async () => {
      // Arrange
      const owner = '0x2902A95209dD88b9C7c379C824AF5B07D8C7Fc5a';
      subgraphClientMock.getNftSubAccountsByOwner.mockResolvedValue([] as NftSubAccount[]);

      const dripListService = await DripListService.new();

      // Act
      const dripLists = await dripListService.getByOwnerAddress(owner);

      // Assert
      expect(dripLists).toEqual([]);
    });

    it("should return the owner's DripLists", async () => {
      // Arrange
      const owner = '0x2902A95209dD88b9C7c379C824AF5B07D8C7Fc5a';
      const ownerNftSubAccounts: NftSubAccount[] = [
        {
          tokenId: '1',
          ownerAddress: owner,
        },
      ];

      subgraphClientMock.getNftSubAccountsByOwner.mockResolvedValue(ownerNftSubAccounts);
      addressDriverClientMock.getUserIdByAddress.mockResolvedValue('1');

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

      // Act
      const dripLists = await dripListService.getByOwnerAddress(owner);

      // Assert
      expect(dripLists).toHaveLength(1);
      expect(nftDriverMetadataManagerMock.fetchAccountMetadata).toHaveBeenCalledTimes(1);
      expect(subgraphClientMock.getNftSubAccountsByOwner).toHaveBeenCalledTimes(1);
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

      const setStreamListProjectsTx = {} as unknown as PopulatedTransaction;
      nftDriverTxFactoryMock.setSplits.mockResolvedValueOnce(setStreamListProjectsTx);

      const setStreamTx = {} as unknown as PopulatedTransaction;
      sut['_buildSetStreamListStreamTxs'] = vi
        .fn(DripListService.prototype['_buildSetStreamListStreamTxs'])
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
        setStreamListProjectsTx: {},
        setStreamTx: {},
      };

      const batchTx = {} as unknown as PopulatedTransaction;
      callerDriverClientMock.populateCallBatchedTx.mockResolvedValueOnce(batchTx);
      callerDriverClientMock.signer.estimateGas.mockResolvedValueOnce(BigNumber.from(1000));

      // Act
      const normalFlowTxs = await sut['_getNormalFlowTxs'](txs, false, callerDriverClientMock);

      // Assert
      expect(normalFlowTxs.txs[0]).toBe(txs.createDripListTx);
      expect(normalFlowTxs.txs[1]).toBe(txs.setStreamListProjectsTx);
      expect(normalFlowTxs.txs[2]).toBe(txs.setStreamTx);
      expect(normalFlowTxs.gasLimitWithBuffer?.toNumber()).toBe(2000);
    });

    it('should return the expected result when it does need approval', async () => {
      // Arrange
      const sut = await DripListService.new();
      const txs: { [name: string]: PopulatedTransaction } = {
        createDripListTx: {},
        setStreamListProjectsTx: {},
        setStreamTx: {},
      };

      const batchTx = {} as unknown as PopulatedTransaction;
      callerDriverClientMock.populateCallBatchedTx.mockResolvedValueOnce(batchTx);
      callerDriverClientMock.signer.estimateGas.mockResolvedValueOnce(BigNumber.from(1000));

      // Act
      const normalFlowTxs = await sut['_getNormalFlowTxs'](txs, true, callerDriverClientMock);

      // Assert
      expect(normalFlowTxs.txs[0]).toBe(txs.createDripListTx);
      expect(normalFlowTxs.txs[1]).toBe(txs.setStreamListProjectsTx);
      expect(normalFlowTxs.txs[2]).toBe(txs.setStreamTx);
      expect(normalFlowTxs.gasLimitWithBuffer).toBeUndefined();
    });
  });

  describe('_publishMetadataToIpfs', () => {
    it('should publish to IPFS and return the hash', async () => {
      // Arrange
      const sut = await DripListService.new();

      nftDriverMetadataManagerMock.pinAccountMetadata.mockResolvedValueOnce('hash');
      addressDriverClientMock.getUserIdByAddress.mockResolvedValueOnce('1');

      // Act
      const hash = await sut['_publishMetadataToIpfs']('1');

      // Assert
      expect(hash).toBe('hash');
    });
  });

  describe('_buildSetStreamListStreamTxs', () => {
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
      addressDriverTxFactoryMock.setStreams.mockResolvedValue(setStreamTx);

      subgraphClientMock.getCurrentStreamsReceivers.mockResolvedValueOnce([]);

      // Act
      const result = await sut['_buildSetStreamListStreamTxs'](
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
