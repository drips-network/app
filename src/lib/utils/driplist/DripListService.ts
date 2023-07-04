import {
  getAddressDriverClient,
  getAddressDriverTxFactory,
  getCallerClient,
  getNFTDriverClient,
  getNFTDriverTxFactory,
  getRepoDriverClient,
  getSubgraphClient,
} from '../get-drips-clients';
import NftDriverMetadataManager from '../metadata/NftDriverMetadataManager';
import type { DripList } from '../metadata/types';
import {
  NFTDriverTxFactory,
  type AddressDriverClient,
  Utils,
  type StreamReceiverStruct,
  AddressDriverTxFactory,
  NFTDriverClient,
  ERC20TxFactory,
  RepoDriverClient,
} from 'radicle-drips';
import type { UserId } from '../metadata/types';
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import type { CallerClient, StreamConfig } from 'radicle-drips';
import { constants, ethers, type PopulatedTransaction, Signer, BigNumber } from 'ethers';
import GitProjectService from '../project/GitProjectService';
import assert from '$lib/utils/assert';
import unreachable from '../unreachable';
import type { Address, IpfsHash } from '../common-types';
import type { State } from '../../../routes/app/(flows)/funder-onboarding/funder-onboarding-flow';
import wallet from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import Emoji from '$lib/components/emoji/emoji.svelte';

const WAITING_WALLET_ICON = {
  component: Emoji,
  props: {
    emoji: '👛',
    size: 'huge',
  },
};

/**
 * A class for managing `DripList`s.
 *
 * **Important**: This class assumes that *all* clients and factories are connected to the *same* signer.
 */
export default class DripListService {
  private readonly SEED_CONSTANT = 'Drips App';

  private _owner!: Signer | undefined;
  private _ownerAddress!: Address | undefined;
  private _nftDriverClient!: NFTDriverClient | undefined;
  private _repoDriverClient!: RepoDriverClient;
  private _gitProjectService!: GitProjectService;
  private _nftDriverTxFactory!: NFTDriverTxFactory;
  private _addressDriverClient!: AddressDriverClient;
  private _addressDriverTxFactory!: AddressDriverTxFactory;
  private readonly _dripsSubgraphClient = getSubgraphClient();
  private readonly _nftDriverMetadataManager = new NftDriverMetadataManager();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Creates a new `DripListService` instance.
   * @returns A new `DripListService` instance.
   */
  public static async new(): Promise<DripListService> {
    const dripListService = new DripListService();

    dripListService._repoDriverClient = await getRepoDriverClient();
    dripListService._gitProjectService = await GitProjectService.new();
    dripListService._addressDriverClient = await getAddressDriverClient();

    const { connected, signer } = get(wallet);

    if (connected) {
      dripListService._nftDriverClient = await getNFTDriverClient();
      dripListService._nftDriverTxFactory = await getNFTDriverTxFactory();
      dripListService._addressDriverTxFactory = await getAddressDriverTxFactory();

      assert(signer, 'Signer address is undefined.');
      dripListService._owner = signer;
      dripListService._ownerAddress = await signer.getAddress();
    }

    return dripListService;
  }

  /**
   * Gets all `DripList`s owned by the given address.
   * @param ownerAddress The address to get `DripList`s for.
   * @returns Owner's `DripList`s.
   * @throws If owner has more than one `DripList` (for the MVP only).
   */
  public async getByOwnerAddress(ownerAddress: Address): Promise<DripList[]> {
    const ownerNftSubAccounts = await this._dripsSubgraphClient.getNftSubAccountsByOwner(
      ownerAddress,
    );

    if (ownerNftSubAccounts?.length === 0) {
      return [];
    }

    const dripLists: DripList[] = [];

    for (const nftSubAccount of ownerNftSubAccounts) {
      const dripList = await this._mapNftSubAccountToDripList(nftSubAccount);

      if (dripList) dripLists.push(dripList);
    }

    return dripLists;
  }

  public async getByTokenId(tokenId: UserId): Promise<DripList | null> {
    const subAccount = await this._dripsSubgraphClient.getNftSubAccountOwnerByTokenId(tokenId);

    if (!subAccount) return null;

    return await this._mapNftSubAccountToDripList(subAccount);
  }

  private async _mapNftSubAccountToDripList(nftSubAccount: {
    tokenId: string;
    ownerAddress: string;
  }): Promise<DripList | null> {
    const nftSubAccountMetadata = await this._nftDriverMetadataManager.fetchAccountMetadata(
      nftSubAccount.tokenId,
    );

    // For now, *all* NFT sub-accounts "are" drip lists, so this check is should always pass.
    if (!nftSubAccountMetadata?.data.isDripList) {
      return null;
    }

    const dripList: DripList = {
      account: {
        driver: 'nft',
        owner: {
          driver: 'address',
          userId: await this._addressDriverClient.getUserIdByAddress(nftSubAccount.ownerAddress),
          address: nftSubAccount.ownerAddress,
        },
        userId: nftSubAccount.tokenId,
      },
      name: nftSubAccountMetadata.data.name || 'Unnamed Drip List',
      // TODO: properties below are post-MVP.
      isPublic: false,
      description: undefined,
    };

    return dripList;

    // TODO: enable this after development.
    // TODO: remove this after the MVP.
    // if (dripLists.length === 2) {
    //   throw new Error(`More than one drip list found for the owner ${ownerAddress}.`);
    // }
  }

  public async buildTransactContext(context: State) {
    assert(
      this._ownerAddress && this._nftDriverClient,
      `This function requires an active wallet connection.`,
    );

    const token = context.supportConfig.listSelected[0] ?? unreachable();
    let amountPerSec = context.supportConfig.streamRateValueParsed ?? unreachable();
    amountPerSec = amountPerSec / BigInt(2592000); // 30 days in seconds.
    const topUpAmount = context.supportConfig.topUpAmountValueParsed ?? unreachable();
    const dripListName = context.dripList.title;

    const projects: { weight: number; userId: string }[] = [];
    for (const [url, percentage] of Object.entries(context.dripList.percentages)) {
      const { forge, repoName, username } = GitProjectService.deconstructUrl(url);
      const projectName = `${username}/${repoName}`;

      projects.push({
        weight: Math.floor((Number(percentage) / 100) * 1000000),
        userId: await this._repoDriverClient.getUserId(forge, projectName),
      });
    }

    const ownerNftSubAccountsCount = (
      await this._dripsSubgraphClient.getNftSubAccountsByOwner(this._ownerAddress)
    ).length;

    const salt = this._calcSaltFromAddress(this._ownerAddress, ownerNftSubAccountsCount);

    const dripListId = await this._nftDriverClient.calcTokenIdWithSalt(this._ownerAddress, salt); // This is the `NftDriver` user ID.

    const ipfsHash = await this._publishMetadataToIpfs(dripListId, dripListName);

    const createDripListTx = await this._buildCreateDripListTx(salt, ipfsHash);

    const setDripListProjectsTx = await this._nftDriverTxFactory.setSplits(
      dripListId,
      projects.map((project) => ({
        userId: project.userId,
        weight: project.weight,
      })),
    );

    const tokenApprovalTx = await this._buildTokenApprovalTx(token);

    const setStreamTx = await this._buildSetDripListStreamTxs(
      salt,
      token,
      dripListId,
      topUpAmount,
      0n,
      0n,
      amountPerSec,
    );

    const allowance = await this._addressDriverClient.getAllowance(token);
    const needsApproval = allowance < topUpAmount;

    const txs: { [name: string]: PopulatedTransaction } = {
      tokenApprovalTx,
      createDripListTx,
      setDripListProjectsTx,
      setStreamTx,
    };

    const callerClient = await getCallerClient();
    const approvalFlowTxs = await this._getApprovalFlowTxs(txs, needsApproval, callerClient);
    const normalFlowTxs = await this._getNormalFlowTxs(txs, needsApproval, callerClient);

    return {
      dripListId,
      needsApproval,
      callerClient,
      approvalFlowTxs,
      normalFlowTxs,
    };
  }

  private async _getApprovalFlowTxs(
    txs: { [name: string]: PopulatedTransaction },
    needsApproval: boolean,
    callerClient: CallerClient,
  ) {
    const { tokenApprovalTx, createDripListTx, setDripListProjectsTx, setStreamTx } = txs;

    const batchTx = await callerClient.populateCallBatchedTx([
      createDripListTx,
      setDripListProjectsTx,
      setStreamTx,
    ]);

    if (!needsApproval) {
      const estimatedGasLimit = await callerClient.signer.estimateGas(batchTx);
      const gasLimit = BigNumber.from(Math.ceil(estimatedGasLimit.toNumber() * 2));

      batchTx.gasLimit = gasLimit;
    } else {
      // !HACK: Hardcoded gas limit for now to avoid the "out of gas" error.
      batchTx.gasLimit = BigNumber.from('0x0a05b6');
    }

    return [
      {
        transaction: tokenApprovalTx,
        waitingSignatureMessage: {
          message: 'Waiting for you to approve access to the ERC-20 token in your wallet...',
          subtitle: 'You only have to do this once per token.',
          icon: WAITING_WALLET_ICON,
        },
      },
      {
        transaction: batchTx,
      },
    ];
  }

  private async _getNormalFlowTxs(
    txs: { [name: string]: PopulatedTransaction },
    needsApproval: boolean,
    callerClient: CallerClient,
  ) {
    const { createDripListTx, setDripListProjectsTx, setStreamTx } = txs;

    if (!needsApproval) {
      const batchTx = await callerClient.populateCallBatchedTx([
        createDripListTx,
        setDripListProjectsTx,
        setStreamTx,
      ]);

      const estimatedGasLimit = await callerClient.signer.estimateGas(batchTx);
      const gasLimitWithBuffer = BigNumber.from(Math.ceil(estimatedGasLimit.toNumber() * 2));

      return {
        txs: [createDripListTx, setDripListProjectsTx, setStreamTx],
        gasLimitWithBuffer,
      };
    }

    return {
      txs: [createDripListTx, setDripListProjectsTx, setStreamTx],
    };
  }

  private async _publishMetadataToIpfs(dripListId: string, name?: string): Promise<IpfsHash> {
    assert(this._ownerAddress, `This function requires an active wallet connection.`);

    const dripListMetadata = this._nftDriverMetadataManager.buildAccountMetadata({
      forAccount: {
        driver: 'nft',
        owner: {
          driver: 'address',
          userId: await this._addressDriverClient.getUserIdByAddress(this._ownerAddress),
          address: this._ownerAddress,
        },
        userId: dripListId,
      },
      name,
    });

    const ipfsHash = await this._nftDriverMetadataManager.pinAccountMetadata(dripListMetadata);

    return ipfsHash;
  }

  private async _buildCreateDripListTx(salt: bigint, ipfsHash: IpfsHash) {
    assert(this._ownerAddress, `This function requires an active wallet connection.`);

    const createDripListTx = await this._nftDriverTxFactory.safeMintWithSalt(
      salt,
      this._ownerAddress,
      [
        {
          key: MetadataManagerBase.USER_METADATA_KEY,
          value: ipfsHash,
        },
      ].map((m) => Utils.Metadata.createFromStrings(m.key, m.value)),
    );

    return createDripListTx;
  }

  private async _buildSetDripListStreamTxs(
    salt: bigint,
    token: Address,
    dripListId: UserId,
    topUpAmount: bigint,
    start: bigint,
    duration: bigint,
    amountPerSec: bigint,
  ) {
    assert(this._ownerAddress, `This function requires an active wallet connection.`);

    const ownerAddressDriverUserId = await this._addressDriverClient.getUserIdByAddress(
      this._ownerAddress,
    );

    const currentReceivers: StreamReceiverStruct[] =
      await this._dripsSubgraphClient.getCurrentStreamsReceivers(
        ownerAddressDriverUserId,
        token,
        get(wallet).provider,
      );

    const config: StreamConfig = {
      start,
      duration,
      amountPerSec,
      dripId: BigInt(this._generateDripIdFromSalt(salt)),
    };

    const newReceivers: StreamReceiverStruct[] = [
      {
        userId: dripListId,
        config: Utils.StreamConfiguration.toUint256(config),
      },
    ];

    const setStreamTx = await this._addressDriverTxFactory.setStreams(
      token,
      currentReceivers,
      topUpAmount,
      newReceivers,
      0,
      0,
      this._ownerAddress,
      /*
      Dirty hack to disable the SDK's built-in gas estimation, because
      it would fail if there's no token approval yet. See `top-up.ts`.

      TODO: Introduce a more graceful method of disabling gas estimation.
      */ { gasLimit: 1 },
    );

    delete setStreamTx.gasLimit;

    return setStreamTx;
  }

  private async _buildTokenApprovalTx(token: Address): Promise<PopulatedTransaction> {
    assert(this._owner, `This function requires an active wallet connection.`);

    const erc20TxFactory = await ERC20TxFactory.create(this._owner, token);

    const tokenApprovalTx = await erc20TxFactory.approve(
      this._addressDriverTxFactory.driverAddress,
      constants.MaxUint256,
    );

    return tokenApprovalTx;
  }

  // We use the count of *all* NFT sub-accounts to generate the salt for the Drip List ID.
  // This is because we want to avoid making HTTP requests to the subgraph for each NFT sub-account to check if it's a Drip List.
  private _calcSaltFromAddress = (address: string, listCount: number): bigint /* 64bit */ => {
    const hash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(['string'], [this.SEED_CONSTANT + address]),
    );
    const randomBigInt = ethers.BigNumber.from('0x' + hash.slice(26));

    let random64BitBigInt = BigInt(randomBigInt.toString()) & BigInt('0xFFFFFFFFFFFFFFFF');

    const listCountBigInt = BigInt(listCount);
    random64BitBigInt = random64BitBigInt ^ listCountBigInt;

    return random64BitBigInt;
  };

  private _generateDripIdFromSalt = (salt: bigint): number /* 32bit */ => {
    const random32BitNumber = Number(salt & BigInt(0xffffffff));

    return random32BitNumber;
  };
}
