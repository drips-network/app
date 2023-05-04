import {
  getAddressDriverClient,
  getNFTDriverClient,
  getNFTDriverTxFactory,
  getSubgraphClient,
} from '../get-drips-clients';
import NftDriverMetadataManager from '../metadata/NftDriverMetadataManager';
import type { ClaimedGitProject, DripList, UnclaimedGitProject } from '../metadata/types';
import RepoDriverMetadataManager from '../metadata/RepoDriverMetadataManager';
import type { z } from 'zod';
import type { repoDriverSplitReceiverSchema } from '../metadata/schemas';
import type { GitProject } from '../metadata/types';
import type { Address } from '../metadata/types';
import {
  NFTDriverTxFactory,
  type AddressDriverClient,
  type NFTDriverClient,
  Utils,
  type Preset,
  type DripsReceiverStruct,
} from 'radicle-drips';
import RepoDriverUtils from '../RepoDriverUtils';
import mapFilterUndefined from '../map-filter-undefined';
import type { UserId } from '../metadata/types';
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import type { DripsReceiverConfig } from 'radicle-drips';
import type { BigNumberish, ContractTransaction } from 'ethers';
import assert from '$lib/utils/assert';

/**
 * A class for managing `DripList`s.
 *
 * **Important**: This class assumes that *all* clients and factories are connected to the *same* signer.
 */
export default class DripListManager {
  private _nftDriverClient!: NFTDriverClient;
  private _nftDriverTxFactory!: NFTDriverTxFactory;
  private _addressDriverClient!: AddressDriverClient;
  private readonly _dripsSubgraphClient = getSubgraphClient();
  private readonly _nftDriverMetadataManager = new NftDriverMetadataManager();
  private readonly _repoDriverMetadataManager = new RepoDriverMetadataManager();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Creates a new `DripListManager` instance.
   * @returns A new `DripListManager` instance.
   */
  public static async new(): Promise<DripListManager> {
    const dripListManager = new DripListManager();

    dripListManager._nftDriverClient = await getNFTDriverClient();
    dripListManager._nftDriverTxFactory = await getNFTDriverTxFactory();
    dripListManager._addressDriverClient = await getAddressDriverClient();

    return dripListManager;
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
      const nftSubAccountMetadata = await this._nftDriverMetadataManager.fetchAccountMetadata(
        nftSubAccount.tokenId,
      );

      // For now, *all* NFT sub-accounts "are" drip lists, so this check is should always pass.
      if (!nftSubAccountMetadata?.data.isDripList) {
        continue;
      }

      const dripList: DripList = {
        account: {
          driver: 'nft',
          owner: ownerAddress,
          userId: nftSubAccount.tokenId,
        },
        projects: await this._getDripListProjects(
          ownerAddress,
          nftSubAccountMetadata.data.projects,
        ),
        // TODO: properties below are post-MVP.
        isPublic: false,
        name: undefined,
        description: undefined,
      };

      dripLists.push(dripList);

      // TODO: remove this after the MVP.
      if (dripLists.length === 2) {
        throw new Error(`More than one drip list found for the owner ${ownerAddress}.`);
      }
    }

    return dripLists;
  }

  /**
   * Creates a new `DripList`.
   * @param ownerAddress(optional) The address to transfer the `DripList` to. If not provided, the signer address of the NFT driver client will be used.
   * @param salt The salt to use for the `DripList` user ID.
   * @returns The new `DripList` user ID.
   * @throws If owner has more than one `DripList` (for the MVP only).
   */
  public async create(salt: number, ownerAddress?: Address): Promise<UserId> {
    // Assuming all clients are connected to the *same* signer we can use any of them.
    ownerAddress = (ownerAddress || (await this._nftDriverClient.signer.getAddress())) as Address;

    // TODO: remove this after the MVP.
    const existingDripLists = await this.getByOwnerAddress(ownerAddress);
    if (existingDripLists.length > 0) {
      throw new Error(`Cannot create more than one drip list for the owner ${ownerAddress}.`);
    }

    return this._nftDriverClient.safeCreateAccountWithSalt(salt, ownerAddress, 'Drips App');
  }

  /**
   * Pins the new `DripList` metadata and creates a batch transaction that consist of the following transactions:
   * - `setSplits` transaction to set the `DripList` splits.
   * - `emitUserMetadata` transaction to set the the latest `DripList` IPFS hash on-chain.
   * @param dripListId The `DripList` user ID.
   * @param listReceivers The `DripList` split receivers.
   * @returns The batch transaction.
   * @throws If the `DripList` does not exist.
   */
  public async buildSetSplitsBatchTx(
    dripListId: UserId,
    projects: z.infer<typeof repoDriverSplitReceiverSchema>[],
  ): Promise<Preset> {
    const dripListNftSubAccount = await this._nftDriverMetadataManager.fetchAccount(dripListId);

    if (!dripListNftSubAccount) {
      throw new Error(`DripList ${dripListId} not found.`);
    }

    const dripListMetadata = this._nftDriverMetadataManager.buildAccountMetadata({
      forAccount: dripListNftSubAccount,
      projects,
    });

    const ipfsHash = await this._nftDriverMetadataManager.pinAccountMetadata(dripListMetadata);

    const setSplitsTx = await this._nftDriverTxFactory.setSplits(
      dripListId,
      projects.map((project) => ({
        userId: project.userId,
        weight: project.weight,
      })),
    );

    const emitMetadataTx = await this._nftDriverTxFactory.emitUserMetadata(
      dripListId,
      [
        {
          key: MetadataManagerBase.USER_METADATA_KEY,
          value: ipfsHash,
        },
      ].map((m) => Utils.Metadata.createFromStrings(m.key, m.value)),
    );

    return [setSplitsTx, emitMetadataTx];
  }

  /**
   * Sets the token stream for the given `DripList`.
   * @param dripListId The `DripList` user ID.
   * @param tokenAddress The token address.
   * @param config The `DripList` configuration.
   * @param balanceDelta The drips balance change to be applied.
   * @returns The contract transaction.
   */
  public async setStream(
    dripListId: UserId,
    tokenAddress: Address,
    config: DripsReceiverConfig,
    balanceDelta: BigNumberish,
  ): Promise<ContractTransaction> {
    const currentReceivers: DripsReceiverStruct[] =
      await this._dripsSubgraphClient.getCurrentDripsReceivers(dripListId, tokenAddress);

    const newReceivers: DripsReceiverStruct[] = [
      {
        userId: dripListId,
        config: Utils.DripsReceiverConfiguration.toUint256(config),
      },
    ];

    const transferToAddress = await this._addressDriverClient.signer?.getAddress();
    assert(transferToAddress);

    return this._addressDriverClient.setDrips(
      tokenAddress,
      currentReceivers,
      newReceivers,
      transferToAddress,
      balanceDelta,
    );
  }

  private async _getDripListProjects(
    ownerAddress: Address,
    projects: z.infer<typeof repoDriverSplitReceiverSchema>[],
  ): Promise<
    {
      weight: number;
      project: GitProject;
    }[]
  > {
    const projectPromises = await Promise.all(
      // Iterate over the projects.
      projects.map(async (project) => {
        // For each project, get the metadata.
        const projectMetadata = await this._repoDriverMetadataManager.fetchAccountMetadata(
          project.userId,
        );

        if (!projectMetadata?.data) {
          return;
        }

        const { repoName, forge } = projectMetadata.data.source;

        const { isClaimed } = await RepoDriverUtils.getOnChainInfo(repoName, forge);

        if (!isClaimed) {
          return {
            weight: project.weight,
            project: {
              claimed: false,
              owner: undefined,
              repoDriverAccount: {
                driver: 'repo',
                userId: project.userId,
              },
              source: project.source,
            } as UnclaimedGitProject,
          };
        }

        return {
          weight: project.weight,
          project: {
            claimed: true,
            owner: {
              driver: 'address',
              userId: await this._addressDriverClient.getUserIdByAddress(ownerAddress),
              address: ownerAddress,
            },
            repoDriverAccount: {
              driver: 'repo',
              userId: project.userId,
            },
            source: project.source,
            color: projectMetadata.data.color,
            emoji: projectMetadata.data.emoji,
            description: projectMetadata.data.description,
          } as ClaimedGitProject,
        };
      }),
    );

    return mapFilterUndefined(projectPromises, (value) => value);
  }
}
