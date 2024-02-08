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
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import type { CallerClient, SplitsReceiverStruct, StreamConfig } from 'radicle-drips';
import { constants, ethers, type PopulatedTransaction, Signer, BigNumber } from 'ethers';
import GitProjectService from '../project/GitProjectService';
import assert from '$lib/utils/assert';
import unreachable from '../unreachable';
import type { Address, IpfsHash } from '../common-types';
import type { State } from '../../flows/create-drip-list-flow/create-drip-list-flow';
import wallet from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import Emoji from '$lib/components/emoji/emoji.svelte';
import { isAddress } from 'ethers/lib/utils';
import type { ListEditorConfig } from '$lib/components/drip-list-members-editor/drip-list-members-editor.svelte';
import { isValidGitUrl } from '../is-valid-git-url';
import type { nftDriverAccountMetadataParser } from '../metadata/schemas';
import type { LatestVersion } from '@efstajas/versioned-parser/lib/types';
import { Forge } from '$lib/graphql/__generated__/base-types';
import mapFilterUndefined from '../map-filter-undefined';

type AccountId = string;

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
  private _nftDriverTxFactory!: NFTDriverTxFactory;
  private _addressDriverClient!: AddressDriverClient;
  private _addressDriverTxFactory!: AddressDriverTxFactory;
  private _nftDriverMetadataManager!: NftDriverMetadataManager;
  private readonly _dripsSubgraphClient = getSubgraphClient();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Creates a new `DripListService` instance.
   * @returns A new `DripListService` instance.
   */
  public static async new(): Promise<DripListService> {
    const dripListService = new DripListService();

    dripListService._repoDriverClient = await getRepoDriverClient();
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

    dripListService._nftDriverMetadataManager = new NftDriverMetadataManager(
      dripListService._nftDriverClient,
    );

    return dripListService;
  }

  public async buildTransactContext(context: State) {
    assert(
      this._ownerAddress && this._nftDriverClient,
      `This function requires an active wallet connection.`,
    );

    const dripListName = context.dripList.title;
    const dripListDescription = context.dripList.description;

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
      dripListDescription,
    );

    const createDripListTx = await this._buildCreateDripListTx(salt, ipfsHash);

    const setDripListSplitsTx = await this._nftDriverTxFactory.setSplits(
      dripListId,
      this._formatSplitReceivers(receivers),
    );

    const callerClient = await getCallerClient();

    if (context.selectedSupportOption === 1) {
      // User wants to create a support stream to the list
      const token = context.continuousSupportConfig.listSelected[0] ?? unreachable();
      let amountPerSec = context.continuousSupportConfig.streamRateValueParsed ?? unreachable();
      amountPerSec = amountPerSec / BigInt(2592000); // 30 days in seconds.
      const topUpAmount = context.continuousSupportConfig.topUpAmountValueParsed ?? unreachable();

      const allowance = await this._addressDriverClient.getAllowance(token);
      const needsApproval = allowance < topUpAmount;

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

      const txs = {
        tokenApprovalTx,
        createDripListTx,
        setDripListSplitsTx,
        setStreamTx,
        giveTx: undefined,
      };

      const approvalFlowTxs = await this._getApprovalFlowTxs(txs, needsApproval, callerClient);
      const normalFlowTxs = await this._getNormalFlowTxs(txs, needsApproval, callerClient);

      return {
        dripListId,
        needsApproval,
        callerClient,
        approvalFlowTxs,
        normalFlowTxs,
      };
    } else if (context.selectedSupportOption === 2) {
      // User wants to make a one-time donation to the list

      const token = context.oneTimeDonationConfig.selectedTokenAddress?.[0] ?? unreachable();
      const donationAmount = context.oneTimeDonationConfig.amount ?? unreachable();

      const allowance = await this._addressDriverClient.getAllowance(token);
      const needsApproval = allowance < donationAmount;
      const tokenApprovalTx = await this._buildTokenApprovalTx(token);

      const txFactory = await getAddressDriverTxFactory();
      const giveTx = await txFactory.give(
        dripListId,
        token,
        donationAmount,
        /*
        Dirty hack to disable the SDK's built-in gas estimation, because
        it would fail if there's no token approval yet.

        TODO: Introduce a more graceful method of disabling gas estimation.
        */
        { gasLimit: 1 },
      );

      const txs = {
        tokenApprovalTx,
        createDripListTx,
        setDripListSplitsTx,
        giveTx,
        setStreamTx: undefined,
      };

      const approvalFlowTxs = await this._getApprovalFlowTxs(txs, needsApproval, callerClient);
      const normalFlowTxs = await this._getNormalFlowTxs(txs, needsApproval, callerClient);

      return {
        dripListId,
        needsApproval,
        callerClient,
        approvalFlowTxs,
        normalFlowTxs,
      };
    } else {
      // No support
      const txs = {
        createDripListTx,
        setDripListSplitsTx,
        setStreamTx: undefined,
        giveTx: undefined,
      };

      const normalFlowTxs = await this._getNormalFlowTxs(txs, false, callerClient);

      return {
        dripListId,
        needsApproval: false,
        callerClient,
        normalFlowTxs,
      };
    }
  }

  public async getProjectsSplitMetadataAndReceivers(listEditorConfig: ListEditorConfig) {
    const projectsInput = Object.entries(listEditorConfig.percentages);

    const receivers: SplitsReceiverStruct[] = [];

    const projectsSplitMetadata: ReturnType<
      typeof nftDriverAccountMetadataParser.parseLatest
    >['projects'] = [];

    for (const [itemId, percentage] of projectsInput) {
      const isAddr = isAddress(itemId);

      const weight = Math.floor((Number(percentage) / 100) * 1000000);

      if (weight <= 0) continue;

      if (isAddr) {
        // AddressDriver recipient
        const receiver = {
          type: 'address' as const,
          weight,
          accountId: await this._addressDriverClient.getAccountIdByAddress(itemId as Address),
        };

        projectsSplitMetadata.push(receiver);
        receivers.push(receiver);
      } else if (isValidGitUrl(itemId)) {
        // RepoDriver recipient
        const { forge, username, repoName } = GitProjectService.deconstructUrl(itemId);

        const numericForgeValue = forge === Forge.GitHub ? 0 : 1;

        const receiver = {
          type: 'repoDriver' as const,
          weight,
          accountId: await this._repoDriverClient.getAccountId(
            numericForgeValue,
            `${username}/${repoName}`,
          ),
        };

        projectsSplitMetadata.push({
          ...receiver,
          source: GitProjectService.populateSource(forge, repoName, username),
        });
        receivers.push(receiver);
      } else {
        // It's the account ID for another Drip List
        const receiver = {
          type: 'dripList' as const,
          weight,
          accountId: itemId,
        };

        projectsSplitMetadata.push(receiver);
        receivers.push(receiver);
      }
    }

    return {
      projectsSplitMetadata,
      receivers: receivers,
    };
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
    txs: {
      tokenApprovalTx: PopulatedTransaction | undefined;
      createDripListTx: PopulatedTransaction | undefined;
      setDripListSplitsTx: PopulatedTransaction | undefined;
      setStreamTx: PopulatedTransaction | undefined;
      giveTx: PopulatedTransaction | undefined;
    },
    needsApproval: boolean,
    callerClient: CallerClient,
  ) {
    const { tokenApprovalTx, createDripListTx, setDripListSplitsTx, setStreamTx, giveTx } = txs;

    const batchTx = await callerClient.populateCallBatchedTx(
      mapFilterUndefined([createDripListTx, setDripListSplitsTx, setStreamTx, giveTx], (v) => v),
    );

    if (!needsApproval) {
      const estimatedGasLimit = await callerClient.signer.estimateGas(batchTx);
      const gasLimit = BigNumber.from(Math.ceil(estimatedGasLimit.toNumber() * 2));

      batchTx.gasLimit = gasLimit;
    } else {
      // !HACK: Hardcoded gas limit for now to avoid the "out of gas" error.
      batchTx.gasLimit = BigNumber.from('0x0a05b6');
    }

    assert(tokenApprovalTx);

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
    txs: {
      createDripListTx: PopulatedTransaction | undefined;
      setDripListSplitsTx: PopulatedTransaction | undefined;
      setStreamTx: PopulatedTransaction | undefined;
      giveTx: PopulatedTransaction | undefined;
    },
    needsApproval: boolean,
    callerClient: CallerClient,
  ) {
    const { createDripListTx, setDripListSplitsTx, setStreamTx, giveTx } = txs;

    if (!needsApproval) {
      const requiredTxs = mapFilterUndefined(
        [createDripListTx, setDripListSplitsTx, setStreamTx, giveTx],
        (v) => v,
      );

      const batchTx = await callerClient.populateCallBatchedTx(requiredTxs);

      const estimatedGasLimit = await callerClient.signer.estimateGas(batchTx);
      const gasLimitWithBuffer = BigNumber.from(Math.ceil(estimatedGasLimit.toNumber() * 2));

      return {
        txs: requiredTxs,
        gasLimitWithBuffer,
      };
    }

    return {
      txs: mapFilterUndefined(
        [createDripListTx, setDripListSplitsTx, setStreamTx, giveTx],
        (v) => v,
      ),
    };
  }

  private async _publishMetadataToIpfs(
    dripListId: string,
    projects: LatestVersion<typeof nftDriverAccountMetadataParser>['projects'],
    name?: string,
    description?: string,
  ): Promise<IpfsHash> {
    assert(this._ownerAddress, `This function requires an active wallet connection.`);

    const dripListMetadata = this._nftDriverMetadataManager.buildAccountMetadata({
      forAccountId: dripListId,
      projects,
      name,
      description,
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
      ...currentReceivers,
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
