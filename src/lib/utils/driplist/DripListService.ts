import {
  getAddressDriverClient,
  getAddressDriverTxFactory,
  getCallerClient,
  getNFTDriverClient,
  getNFTDriverTxFactory,
} from '../get-drips-clients';
import NftDriverMetadataManager from '../metadata/NftDriverMetadataManager';
import {
  NFTDriverTxFactory,
  AddressDriverClient,
  Utils,
  AddressDriverTxFactory,
  NFTDriverClient,
  ERC20TxFactory,
} from 'radicle-drips';
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import type { SplitsReceiverStruct } from 'radicle-drips';
import { constants, ethers, type PopulatedTransaction, Signer, BigNumber } from 'ethers';
import GitProjectService from '../project/GitProjectService';
import assert from '$lib/utils/assert';
import type { Address, IpfsHash } from '../common-types';
import wallet from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import Emoji from '$lib/components/emoji/emoji.svelte';
import type { nftDriverAccountMetadataParser } from '../metadata/schemas';
import type { LatestVersion } from '@efstajas/versioned-parser';
import { gql } from 'graphql-request';
import query from '$lib/graphql/dripsQL';
import type {
  MintedNftAccountsCountQuery,
  MintedNftAccountsCountQueryVariables,
} from './__generated__/gql.generated';
import type { Items, Weights } from '$lib/components/list-editor/types';
import { buildStreamCreateBatchTx } from '../streams/streams';

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
  private _nftDriverTxFactory!: NFTDriverTxFactory;
  private _addressDriverClient!: AddressDriverClient;
  private _addressDriverTxFactory!: AddressDriverTxFactory;
  private _nftDriverMetadataManager!: NftDriverMetadataManager;

  private constructor() {}

  /**
   * Creates a new `DripListService` instance.
   * @returns A new `DripListService` instance.
   */
  public static async new(): Promise<DripListService> {
    const dripListService = new DripListService();

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

  public async buildTransactContext(config: {
    listTitle: string;
    listDescription?: string;
    weights: Weights;
    items: Items;
    support?:
      | {
          type: 'continuous';
          tokenAddress: string;
          amountPerSec: bigint;
          topUpAmount: bigint;
        }
      | {
          type: 'one-time';
          tokenAddress: string;
          donationAmount: bigint;
        };
    latestVotingRoundId?: string;
  }) {
    assert(
      this._ownerAddress && this._nftDriverClient,
      `This function requires an active wallet connection.`,
    );

    const { listTitle, listDescription, weights, items, support, latestVotingRoundId } = config;

    const { projectsSplitMetadata, receivers } = await this.getProjectsSplitMetadataAndReceivers(
      weights,
      items,
    );

    const mintedNftAccountsCountQuery = gql`
      query MintedNftAccountsCount($ownerAddress: String!) {
        mintedTokensCountByOwnerAddress(ownerAddress: $ownerAddress)
      }
    `;

    const mintedNftAccountsCountRes = await query<
      MintedNftAccountsCountQuery,
      MintedNftAccountsCountQueryVariables
    >(mintedNftAccountsCountQuery, { ownerAddress: this._ownerAddress });
    const mintedNftAccountsCount = mintedNftAccountsCountRes.mintedTokensCountByOwnerAddress ?? 0;

    const salt = this._calcSaltFromAddress(this._ownerAddress, mintedNftAccountsCount);

    const listId = await this._nftDriverClient.calcTokenIdWithSalt(this._ownerAddress, salt); // This is the `NftDriver` user ID.

    const ipfsHash = await this._publishMetadataToIpfs(
      listId,
      projectsSplitMetadata,
      listTitle,
      listDescription,
      latestVotingRoundId,
    );

    const createDripListTx = await this._buildCreateDripListTx(salt, ipfsHash);

    const setDripListSplitsTx = await this._nftDriverTxFactory.setSplits(
      listId,
      this._formatSplitReceivers(receivers),
    );

    let needsApprovalForToken: string | undefined;
    let txs: PopulatedTransaction[];

    if (support?.type === 'continuous') {
      const { tokenAddress, amountPerSec, topUpAmount } = support;

      const allowance = await this._addressDriverClient.getAllowance(tokenAddress);
      const needsApproval = allowance < topUpAmount;

      if (needsApproval) {
        needsApprovalForToken = tokenAddress;
      }

      const setStreamTx = await this._buildSetDripListStreamTxs(
        tokenAddress,
        listId,
        topUpAmount,
        amountPerSec,
      );

      txs = [createDripListTx, setDripListSplitsTx, ...setStreamTx.batch];
    } else if (support?.type === 'one-time') {
      const { tokenAddress, donationAmount } = support;

      const allowance = await this._addressDriverClient.getAllowance(tokenAddress);
      const needsApproval = allowance < donationAmount;

      if (needsApproval) {
        needsApprovalForToken = tokenAddress;
      }

      const txFactory = await getAddressDriverTxFactory();
      const giveTx = await txFactory.give(
        listId,
        tokenAddress,
        donationAmount,
        /*
        Dirty hack to disable the SDK's built-in gas estimation, because
        it would fail if there's no token approval yet.

        TODO: Introduce a more graceful method of disabling gas estimation.
        */
        { gasLimit: 1 },
      );

      txs = [createDripListTx, setDripListSplitsTx, giveTx];
    } else {
      // No support
      txs = [createDripListTx, setDripListSplitsTx];
    }

    const callerClient = await getCallerClient();
    const batch = await callerClient.populateCallBatchedTx(txs);

    return {
      txs: [
        ...(needsApprovalForToken
          ? [
              {
                transaction: await this._buildTokenApprovalTx(needsApprovalForToken),
                waitingSignatureMessage: {
                  message: `Waiting for you to approve Drips access to the ERC-20 token in your wallet...`,
                  subtitle: 'You only have to do this once per token.',
                  icon: WAITING_WALLET_ICON,
                },
                applyGasBuffer: false,
              },
            ]
          : []),
        {
          transaction: batch,
          applyGasBuffer: true,
        },
      ],
      dripListId: listId,
    };
  }

  public async getProjectsSplitMetadataAndReceivers(weights: Weights, items: Items) {
    const projectsInput = Object.entries(weights);

    const receivers: SplitsReceiverStruct[] = [];

    const projectsSplitMetadata: ReturnType<
      typeof nftDriverAccountMetadataParser.parseLatest
    >['projects'] = [];

    for (const [accountId, weight] of projectsInput) {
      const item = items[accountId];
      if (weight <= 0) continue;

      switch (item.type) {
        case 'address': {
          const receiver = {
            type: 'address' as const,
            weight,
            accountId,
          };

          projectsSplitMetadata.push(receiver);
          receivers.push(receiver);

          break;
        }
        case 'project': {
          const { forge, ownerName, repoName } = item.project.source;

          const receiver = {
            type: 'repoDriver' as const,
            weight,
            accountId,
          };

          projectsSplitMetadata.push({
            ...receiver,
            source: GitProjectService.populateSource(forge, repoName, ownerName),
          });

          receivers.push(receiver);

          break;
        }
        case 'drip-list': {
          const receiver = {
            type: 'dripList' as const,
            weight,
            accountId,
          };

          projectsSplitMetadata.push(receiver);
          receivers.push(receiver);

          break;
        }
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
    token: Address,
    dripListId: AccountId,
    topUpAmount: bigint,
    amountPerSec: bigint,
  ) {
    assert(this._owner, `This function requires an active wallet connection.`);

    return await buildStreamCreateBatchTx(
      this._addressDriverClient,
      this._owner,
      {
        tokenAddress: token,
        amountPerSecond: amountPerSec,
        recipientAccountId: dripListId,
        name: undefined,
      },
      topUpAmount,
    );
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

  private async _publishMetadataToIpfs(
    dripListId: string,
    projects: LatestVersion<typeof nftDriverAccountMetadataParser>['projects'],
    name?: string,
    description?: string,
    latestVotingRoundId?: string,
  ): Promise<IpfsHash> {
    assert(this._ownerAddress, `This function requires an active wallet connection.`);

    const dripListMetadata = this._nftDriverMetadataManager.buildAccountMetadata({
      forAccountId: dripListId,
      projects,
      name,
      description,
      latestVotingRoundId,
    });

    const ipfsHash = await this._nftDriverMetadataManager.pinAccountMetadata(dripListMetadata);

    return ipfsHash;
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
