import type {
  AddressDriverClient,
  AddressDriverTxFactory,
  DripsSubgraphClient,
  NFTDriverClient,
  NFTDriverTxFactory,
} from 'radicle-drips';
import type { ContractTransaction, Signer } from 'ethers';
import {
  getAddressDriverClient,
  getAddressDriverTxFactory,
  getNFTDriverClient,
  getNFTDriverTxFactory,
  getSubgraphClient,
} from '$lib/utils/get-drips-clients';
import type NftDriverMetadataManager from '$lib/metadata/NftDriverMetadataManager';
import MetadataManagerFactory from '$lib/metadata/MetadataManagerFactory';
import DripListQueries from './DripListQueries';
import type { gitDriverSplitReceiverSchema } from '$lib/metadata/schemas';
import type { z } from 'zod';
import type { NFTDriverAccount } from '$lib/metadata/types';

type DripsListTokenId = string;

export default class FunderDripListManager {
  private _singer!: Signer;
  private _account!: NFTDriverAccount;
  private _dripListQueries!: DripListQueries;
  private _nftDriverClient!: NFTDriverClient;
  private _nftDriverTxFactory!: NFTDriverTxFactory;
  private _addressDriverClient!: AddressDriverClient;
  private _dripsSubgraphClient!: DripsSubgraphClient;
  private _nftMetadataManager!: NftDriverMetadataManager;
  private _addressDriverTxFactory!: AddressDriverTxFactory;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static async new(account: NFTDriverAccount): Promise<FunderDripListManager>;
  public static async new(
    account: NFTDriverAccount,
    nftDriverClient: NFTDriverClient,
    nftDriverTxFactory: NFTDriverTxFactory,
    addressDriverClient: AddressDriverClient,
    dripsSubgraphClient: DripsSubgraphClient,
    nftMetadataManager: NftDriverMetadataManager,
    addressDriverTxFactory: AddressDriverTxFactory,
    dripListQueries: DripListQueries,
  ): Promise<FunderDripListManager>;
  public static async new(
    account: NFTDriverAccount,
    nftDriverClient?: NFTDriverClient,
    nftDriverTxFactory?: NFTDriverTxFactory,
    addressDriverClient?: AddressDriverClient,
    dripsSubgraphClient?: DripsSubgraphClient,
    nftMetadataManager?: NftDriverMetadataManager,
    addressDriverTxFactory?: AddressDriverTxFactory,
    dripListQueries?: DripListQueries,
  ): Promise<FunderDripListManager> {
    dripsSubgraphClient ??= getSubgraphClient();
    nftDriverClient ??= await getNFTDriverClient();
    nftDriverTxFactory ??= await getNFTDriverTxFactory();
    addressDriverClient ??= await getAddressDriverClient();
    addressDriverTxFactory ??= await getAddressDriverTxFactory();
    nftMetadataManager ??= MetadataManagerFactory.getNftDriverMetadataManager();
    dripListQueries ??= new DripListQueries(dripsSubgraphClient, nftMetadataManager);

    if (
      (await nftDriverClient.signer.getAddress()) !==
        (await nftDriverTxFactory.signer.getAddress()) ||
      (await nftDriverClient.signer.getAddress()) !==
        (await addressDriverClient.signer?.getAddress()) ||
      (await nftDriverClient.signer.getAddress()) !==
        (await addressDriverTxFactory.signer?.getAddress()) ||
      (await nftDriverClient.signer.getAddress()) !== account.owner
    ) {
      throw new Error('Signers do not match.');
    }

    const manager = new FunderDripListManager();
    manager._account = account;
    manager._dripListQueries = dripListQueries;
    manager._nftDriverClient = nftDriverClient;
    manager._nftDriverTxFactory = nftDriverTxFactory;
    manager._addressDriverClient = addressDriverClient;
    manager._dripsSubgraphClient = dripsSubgraphClient;
    manager._addressDriverTxFactory = addressDriverTxFactory;
    manager._singer = nftDriverClient.signer; // All the clients should have the same signer, so we can just use one of them.

    return manager;
  }

  public async getDripLists(): Promise<DripsListTokenId[]> {
    return this._dripListQueries.getDripListsByOwner(this._account.owner);
  }

  public async createDripList(projects: z.infer<typeof gitDriverSplitReceiverSchema>[]): Promise<{
    dripListTokenId: DripsListTokenId;
    ifpsHash: string;
    tx: ContractTransaction;
  }> {
    try {
      // TODO: remove this after MVP.
      // This call acts as a validation that the user has *one* drips list, as it will throw if the user has more than one.
      await this.getDripLists();

      const dripListTokenId = await this._nftDriverClient.safeCreateAccount(
        this._account.owner,
        'Drips App', // TODO: change if needed.
      );

      const dripListMetadata = this._nftMetadataManager.buildAccountMetadata({
        forAccount: this._account,
        projects,
      });

      const { newHash, tx } = await this._nftMetadataManager.updateAccountMetadata(
        dripListMetadata,
        undefined,
      );

      return { dripListTokenId, ifpsHash: newHash, tx };
    } catch (error: unknown) {
      throw new Error(`Failed to create drip list for ${this._account.owner}: ${error}`);
    }
  }

  // public async setSupportingProjectsTxs(
  //   listId: DripListId,
  //   projectSplits: SplitsReceiverStruct[],
  //   userMetadata?: UserMetadata[],
  // ): Promise<PopulatedTransaction[]> {
  //   const batch: PopulatedTransaction[] = [];

  //   const setSplitsTx = await this._nftDriverTxFactory.setSplits(listId, projectSplits);
  //   batch.push(setSplitsTx);

  //   if (userMetadata?.length) {
  //     const emitUserMetadataTx = await this._nftDriverTxFactory.emitUserMetadata(
  //       listId,
  //       userMetadata,
  //     );
  //     batch.push(emitUserMetadataTx);
  //   }

  //   return batch;
  // }

  // public async setDripListStreamTx(
  //   listId: DripListId,
  //   erc20: string,
  //   balanceDelta: BigNumberish,
  // ): Promise<PopulatedTransaction[]> {
  //   const batch: PopulatedTransaction[] = [];

  //   const addressDriverUserId = await this._addressDriverClient.getUserId();

  //   const currentReceivers = await this._dripsSubgraphClient.getCurrentDripsReceivers(
  //     addressDriverUserId,
  //     erc20,
  //   );

  //   const setDripsTx = await this._addressDriverTxFactory.setDrips(
  //     erc20,
  //     currentReceivers,
  //     balanceDelta,
  //     [
  //       {
  //         userId: listId, // Set the drips list as the receiver.
  //         config: 2,
  //       },
  //     ],
  //     0,
  //     0,
  //     await this._singer.getAddress(),
  //   );
  //   batch.push(setDripsTx);

  //   return batch;
  // }
}
