import NftDriverMetadataManager from '../metadata/NftDriverMetadataManager';
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import { ethers, MaxUint256, type Signer, toBigInt } from 'ethers';
import GitProjectService from '../project/GitProjectService';
import assert from '$lib/utils/assert';
import type { Address, IpfsHash } from '../common-types';
import wallet from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import Emoji from '$lib/components/emoji/emoji.svelte';
import type { nftDriverAccountMetadataParser } from '../metadata/schemas';
import type { LatestVersion } from '@efstajas/versioned-parser';
import type { Items, Weights } from '$lib/components/list-editor/types';
import { buildStreamCreateBatchTx } from '../streams/streams';
import {
  executeNftDriverReadMethod,
  executeNftDriverWriteMethod,
  populateNftDriverWriteTx,
} from '../sdk/nft-driver/nft-driver';
import type { OxString, SplitsReceiver } from '../sdk/sdk-types';
import {
  getAddressDriverAllowance,
  populateAddressDriverWriteTx,
} from '../sdk/address-driver/address-driver';
import type { ContractTransaction } from 'ethers';
import { populateErc20WriteTx } from '../sdk/erc20/erc20';
import { formatSplitReceivers } from '../sdk/utils/format-split-receivers';
import keyValueToMetatada from '../sdk/utils/key-value-to-metadata';
import { populateCallerWriteTx } from '../sdk/caller/caller';
import txToCallerCall from '../sdk/utils/tx-to-caller-call';
import network from '$lib/stores/wallet/network';

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
  private _nftDriverMetadataManager!: NftDriverMetadataManager;

  private constructor() {}

  /**
   * Creates a new `DripListService` instance.
   * @returns A new `DripListService` instance.
   */
  public static async new(): Promise<DripListService> {
    const dripListService = new DripListService();

    const { connected, signer } = get(wallet);

    if (connected) {
      assert(signer, 'Signer address is undefined.');
      dripListService._owner = signer;
      dripListService._ownerAddress = await signer.getAddress();

      dripListService._nftDriverMetadataManager = new NftDriverMetadataManager(
        executeNftDriverWriteMethod,
      );
    } else {
      dripListService._nftDriverMetadataManager = new NftDriverMetadataManager();
    }

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
    isVisible: boolean;
  }) {
    assert(this._ownerAddress, `This function requires an active wallet connection.`);

    const { listTitle, listDescription, weights, items, support, latestVotingRoundId, isVisible } =
      config;

    const { projectsSplitMetadata, receivers } = await this.getProjectsSplitMetadataAndReceivers(
      weights,
      items,
    );

    const salt = this._calcSaltFromAddress(this._ownerAddress);

    const listId = (
      await executeNftDriverReadMethod({
        functionName: 'calcTokenIdWithSalt',
        args: [this._ownerAddress as OxString, salt],
      })
    ).toString();

    const ipfsHash = await this._publishMetadataToIpfs(
      listId,
      projectsSplitMetadata,
      isVisible,
      listTitle,
      listDescription,
      latestVotingRoundId,
    );

    const createDripListTx = await this._buildCreateDripListTx(salt, ipfsHash);

    const setDripListSplitsTx = await populateNftDriverWriteTx({
      functionName: 'setSplits',
      args: [toBigInt(listId), formatSplitReceivers(receivers)],
    });

    let needsApprovalForToken: string | undefined;
    let txs: ContractTransaction[];

    if (support?.type === 'continuous') {
      const { tokenAddress, amountPerSec, topUpAmount } = support;

      const allowance = await getAddressDriverAllowance(tokenAddress as OxString);
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

      const allowance = await getAddressDriverAllowance(tokenAddress as OxString);
      const needsApproval = allowance < donationAmount;

      if (needsApproval) {
        needsApprovalForToken = tokenAddress;
      }

      const giveTx = await populateAddressDriverWriteTx({
        functionName: 'give',
        args: [toBigInt(listId), tokenAddress as OxString, donationAmount],
      });

      txs = [createDripListTx, setDripListSplitsTx, giveTx];
    } else {
      // No support
      txs = [createDripListTx, setDripListSplitsTx];
    }

    const batch = await populateCallerWriteTx({
      functionName: 'callBatched',
      args: [txs.map(txToCallerCall)],
    });

    return {
      txs: [
        ...(needsApprovalForToken
          ? [
              {
                title: `Approve Drips to withdraw ${needsApprovalForToken}`,
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
          title: 'Creating the Drip List',
          transaction: batch,
          applyGasBuffer: true,
        },
      ],
      dripListId: listId,
    };
  }

  public async getProjectsSplitMetadataAndReceivers(weights: Weights, items: Items) {
    const projectsInput = Object.entries(weights);

    const receivers: SplitsReceiver[] = [];

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

  private async _buildCreateDripListTx(salt: bigint, ipfsHash: IpfsHash) {
    assert(this._ownerAddress, `This function requires an active wallet connection.`);

    const createDripListTx = await populateNftDriverWriteTx({
      functionName: 'safeMintWithSalt',
      args: [
        salt,
        this._ownerAddress as OxString,
        [
          {
            key: MetadataManagerBase.USER_METADATA_KEY,
            value: ipfsHash,
          },
        ].map(keyValueToMetatada),
      ],
    });

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

  private async _buildTokenApprovalTx(token: Address): Promise<ContractTransaction> {
    assert(this._owner, `This function requires an active wallet connection.`);

    const tokenApprovalTx = await populateErc20WriteTx({
      token: token as OxString,
      functionName: 'approve',
      args: [network.contracts.ADDRESS_DRIVER as OxString, MaxUint256],
    });

    return tokenApprovalTx;
  }

  private async _publishMetadataToIpfs(
    dripListId: string,
    projects: LatestVersion<typeof nftDriverAccountMetadataParser>['projects'],
    isVisible: boolean,
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
      isVisible,
    });

    const ipfsHash = await this._nftDriverMetadataManager.pinAccountMetadata(dripListMetadata);

    return ipfsHash;
  }

  // Create random salt from address
  private _calcSaltFromAddress = (address: string): bigint /* 64bit */ => {
    const hash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(['string'], [this.SEED_CONSTANT + address]),
    );
    const randomBigInt = ethers.toBigInt('0x' + hash.slice(26));

    return BigInt(randomBigInt.toString()) & BigInt('0xFFFFFFFFFFFFFFFF');
  };
}
