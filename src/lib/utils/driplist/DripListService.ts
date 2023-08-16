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
import type {
  AddressDriverSplitReceiver,
  DripList,
  RepoDriverSplitReceiver,
} from '../metadata/types';
import {
  NFTDriverTxFactory,
  AddressDriverClient,
  Utils,
  type StreamReceiverStruct,
  AddressDriverTxFactory,
  NFTDriverClient,
  ERC20TxFactory,
  RepoDriverClient,
} from 'radicle-drips';
import type { AccountId } from '../metadata/types';
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import type { CallerClient, SplitsReceiverStruct, StreamConfig } from 'radicle-drips';
import { constants, ethers, type PopulatedTransaction, Signer, BigNumber } from 'ethers';
import GitProjectService from '../project/GitProjectService';
import assert from '$lib/utils/assert';
import unreachable from '../unreachable';
import type { Address, IpfsHash } from '../common-types';
import type { State } from '../../../routes/app/(flows)/funder-onboarding/funder-onboarding-flow';
import wallet from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import Emoji from '$lib/components/emoji/emoji.svelte';
import type {
  addressDriverSplitReceiverSchema,
  repoDriverSplitReceiverSchema,
} from '../metadata/schemas';
import { isAddress } from 'ethers/lib/utils';
import type { z } from 'zod';
import mapFilterUndefined from '../map-filter-undefined';
import type { ListEditorConfig } from '$lib/components/list-editor/list-editor.svelte';

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

  public async getByTokenId(tokenId: AccountId): Promise<DripList | null> {
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
          accountId: await this._addressDriverClient.getAccountIdByAddress(
            nftSubAccount.ownerAddress,
          ),
          address: nftSubAccount.ownerAddress,
        },
        accountId: nftSubAccount.tokenId,
      },
      name: nftSubAccountMetadata.data.name || 'Unnamed Drip List',
      // TODO: properties below are post-MVP.
      isPublic: false,
      projects: await this._getDripListProjects(nftSubAccountMetadata.data.projects),
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

    const { projectsSplitMetadata, receivers } = await this.getProjectsSplitMetadataAndReceivers(
      context.dripList,
    );

    const ownerNftSubAccountsCount = (
      await this._dripsSubgraphClient.getNftSubAccountsByOwner(this._ownerAddress)
    ).length;

    const salt = this._calcSaltFromAddress(this._ownerAddress, ownerNftSubAccountsCount);

    const dripListId = await this._nftDriverClient.calcTokenIdWithSalt(this._ownerAddress, salt); // This is the `NftDriver` user ID.

    const ipfsHash = await this._publishMetadataToIpfs(
      dripListId,
      projectsSplitMetadata,
      dripListName,
    );

    const createDripListTx = await this._buildCreateDripListTx(salt, ipfsHash);

    const setStreamListProjectsTx = await this._nftDriverTxFactory.setSplits(
      dripListId,
      this._formatSplitReceivers(receivers),
    );

    const tokenApprovalTx = await this._buildTokenApprovalTx(token);

    const setStreamTx = await this._buildSetStreamListStreamTxs(
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
      setStreamListProjectsTx,
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

  public async getProjectsSplitMetadataAndReceivers(listEditorConfig: ListEditorConfig) {
    const projectsInput = Object.entries(listEditorConfig.percentages);

    const receivers: SplitsReceiverStruct[] = [];

    const projectsSplitMetadata: (
      | z.infer<typeof addressDriverSplitReceiverSchema>
      | z.infer<typeof repoDriverSplitReceiverSchema>
    )[] = [];

    for (const [urlOrAddress, percentage] of projectsInput) {
      const isAddr = isAddress(urlOrAddress);

      const weight = Math.floor((Number(percentage) / 100) * 1000000);

      if (weight <= 0) continue;

      if (isAddr) {
        const receiver = {
          weight,
          accountId: await this._addressDriverClient.getAccountIdByAddress(urlOrAddress as Address),
        };

        projectsSplitMetadata.push(receiver);
        receivers.push(receiver);
      } else {
        const { forge, username, repoName } = GitProjectService.deconstructUrl(urlOrAddress);

        const receiver = {
          weight,
          accountId: await this._repoDriverClient.getAccountId(forge, `${username}/${repoName}`),
        };

        projectsSplitMetadata.push({
          ...receiver,
          source: GitProjectService.populateSource(forge, repoName, username),
        });
        receivers.push(receiver);
      }
    }

    return {
      projectsSplitMetadata,
      receivers,
    };
  }

  private async _getDripListProjects(
    projects: z.infer<
      typeof repoDriverSplitReceiverSchema | typeof addressDriverSplitReceiverSchema
    >[],
  ) {
    const projectPromises = await Promise.all(
      projects.map(async (listProjMetadata) => {
        const mapRepoDriverSplitReceiver = (
          metadata: z.infer<typeof repoDriverSplitReceiverSchema>,
        ): RepoDriverSplitReceiver => ({
          weight: metadata.weight,
          account: {
            driver: 'repo',
            accountId: metadata.accountId,
          },
          source: metadata.source,
        });

        const mapAddressDriverSplitReceiver = (
          metadata: z.infer<typeof addressDriverSplitReceiverSchema>,
        ): AddressDriverSplitReceiver => ({
          weight: metadata.weight,
          account: {
            driver: 'address',
            accountId: metadata.accountId,
            address: AddressDriverClient.getUserAddress(metadata.accountId),
          },
        });

        return 'source' in listProjMetadata
          ? mapRepoDriverSplitReceiver(listProjMetadata)
          : mapAddressDriverSplitReceiver(listProjMetadata);
      }),
    );

    return mapFilterUndefined(projectPromises, (value) => value);
  }

  // TODO: Copied from the SDK. Replace this when the SDK makes this function public.
  private _formatSplitReceivers(receivers: SplitsReceiverStruct[]): SplitsReceiverStruct[] {
    // Splits receivers must be sorted by user ID, deduplicated, and without weights <= 0.

    const uniqueReceivers = receivers.reduce((unique: SplitsReceiverStruct[], o) => {
      if (
        !unique.some(
          (obj: SplitsReceiverStruct) => obj.accountId === o.accountId && obj.weight === o.weight,
        )
      ) {
        unique.push(o);
      }
      return unique;
    }, []);

    const sortedReceivers = uniqueReceivers.sort((a, b) =>
      // Sort by user ID.
      BigNumber.from(a.accountId).gt(BigNumber.from(b.accountId))
        ? 1
        : BigNumber.from(a.accountId).lt(BigNumber.from(b.accountId))
        ? -1
        : 0,
    );

    return sortedReceivers;
  }

  private async _getApprovalFlowTxs(
    txs: { [name: string]: PopulatedTransaction },
    needsApproval: boolean,
    callerClient: CallerClient,
  ) {
    const { tokenApprovalTx, createDripListTx, setStreamListProjectsTx, setStreamTx } = txs;

    const batchTx = await callerClient.populateCallBatchedTx([
      createDripListTx,
      setStreamListProjectsTx,
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
    const { createDripListTx, setStreamListProjectsTx, setStreamTx } = txs;

    if (!needsApproval) {
      const batchTx = await callerClient.populateCallBatchedTx([
        createDripListTx,
        setStreamListProjectsTx,
        setStreamTx,
      ]);

      const estimatedGasLimit = await callerClient.signer.estimateGas(batchTx);
      const gasLimitWithBuffer = BigNumber.from(Math.ceil(estimatedGasLimit.toNumber() * 2));

      return {
        txs: [createDripListTx, setStreamListProjectsTx, setStreamTx],
        gasLimitWithBuffer,
      };
    }

    return {
      txs: [createDripListTx, setStreamListProjectsTx, setStreamTx],
    };
  }

  private async _publishMetadataToIpfs(
    dripListId: string,
    projects: z.infer<
      typeof repoDriverSplitReceiverSchema | typeof addressDriverSplitReceiverSchema
    >[],
    name?: string,
  ): Promise<IpfsHash> {
    assert(this._ownerAddress, `This function requires an active wallet connection.`);

    const dripListMetadata = this._nftDriverMetadataManager.buildAccountMetadata({
      forAccount: {
        driver: 'nft',
        owner: {
          driver: 'address',
          accountId: await this._addressDriverClient.getAccountIdByAddress(this._ownerAddress),
          address: this._ownerAddress,
        },
        accountId: dripListId,
      },
      projects,
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

  private async _buildSetStreamListStreamTxs(
    salt: bigint,
    token: Address,
    dripListId: AccountId,
    topUpAmount: bigint,
    start: bigint,
    duration: bigint,
    amountPerSec: bigint,
  ) {
    assert(this._ownerAddress, `This function requires an active wallet connection.`);

    const ownerAddressDriverAccountId = await this._addressDriverClient.getAccountIdByAddress(
      this._ownerAddress,
    );

    const currentReceivers: StreamReceiverStruct[] =
      await this._dripsSubgraphClient.getCurrentStreamsReceivers(
        ownerAddressDriverAccountId,
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
        accountId: dripListId,
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
