import {
  AddressDriverClient,
  type RepoDriverClient,
  RepoDriverTxFactory,
  Utils,
  type SplitsReceiverStruct,
  DripsTxFactory,
} from 'radicle-drips';
import {
  getAddressDriverClient,
  getDripsTxFactory,
  getRepoDriverClient,
  getRepoDriverTxFactory,
} from '../get-drips-clients';
import RepoDriverMetadataManager from '../metadata/RepoDriverMetadataManager';
import type { Address } from '../common-types';
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import { isAddress } from 'ethers/lib/utils';
import type { State } from '../../../routes/app/(flows)/claim-project/claim-project-flow';
import { BigNumber, type ContractTransaction, type PopulatedTransaction } from 'ethers';
import { get } from 'svelte/store';
import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import type { ListEditorConfig } from '$lib/components/drip-list-members-editor/drip-list-members-editor.svelte';
import type { LatestVersion } from '@efstajas/versioned-parser/lib/types';
import type { repoDriverAccountMetadataParser } from '../metadata/schemas';
import { GitProjectService } from './GitProjectService';
import { populateSource } from './git-project-utils';
import type { ClaimedGitProject } from './types';

// TODO: there is some duplication between this class and `DripListService` for mapping splits. To refactor.
export default class GitProjectTxBuilder {
  private readonly _dripsTxFactory: DripsTxFactory;
  private readonly _gitProjectService: GitProjectService;
  private readonly _repoDriverClient: RepoDriverClient;
  private readonly _repoDriverTxFactory: RepoDriverTxFactory;
  private readonly _addressDriverClient: AddressDriverClient;
  private readonly _repoDriverMetadataManager = new RepoDriverMetadataManager();

  private constructor(
    dripsTxFactory: DripsTxFactory,
    gitProjectService: GitProjectService,
    repoDriverClient: RepoDriverClient,
    repoDriverTxFactory: RepoDriverTxFactory,
    addressDriverClient: AddressDriverClient,
  ) {
    this._dripsTxFactory = dripsTxFactory;
    this._gitProjectService = gitProjectService;
    this._repoDriverClient = repoDriverClient;
    this._repoDriverTxFactory = repoDriverTxFactory;
    this._addressDriverClient = addressDriverClient;
  }

  public static async new(): Promise<GitProjectTxBuilder> {
    const { connected, signer } = get(wallet);

    if (connected) {
      assert(signer, 'Signer address is undefined.');
    }

    return new GitProjectTxBuilder(
      await getDripsTxFactory(),
      await GitProjectService.new(),
      await getRepoDriverClient(),
      await getRepoDriverTxFactory(),
      await getAddressDriverClient(),
    );
  }

  public async buildRequestOwnerUpdateTx(context: State): Promise<ContractTransaction> {
    const { forge, username, repoName } = GitProjectService.deconstructUrl(context.gitUrl);
    const projectName = `${username}/${repoName}`;

    const requestOwnerUpdateTx = await this._repoDriverClient.requestOwnerUpdate(
      forge,
      projectName,
    );

    return requestOwnerUpdateTx;
  }

  public async buildUpdateSplitsBatchTx(
    accountId: string,
    highLevelPercentages: { [slug: string]: number },
    maintainers: ListEditorConfig,
    dependencies: ListEditorConfig,
  ): Promise<PopulatedTransaction[]> {
    assert(this._repoDriverTxFactory, `This function requires an active wallet connection.`);

    const {
      tx: setSplitsTx,
      dependenciesSplitMetadata,
      maintainersSplitsMetadata,
    } = await this._buildSetSplitsTxAndMetadata(
      accountId,
      highLevelPercentages,
      maintainers,
      dependencies,
    );

    const currentMetadata = await this._repoDriverMetadataManager.fetchAccountMetadata(accountId);
    assert(currentMetadata, `The project with user ID ${accountId} does not exist.`);

    const newMetadata = {
      ...currentMetadata.data,
      splits: {
        dependencies: dependenciesSplitMetadata,
        maintainers: maintainersSplitsMetadata,
      },
    };

    const ipfsHash = await this._repoDriverMetadataManager.pinAccountMetadata(newMetadata);

    const accountMetadataAsBytes = [
      {
        key: MetadataManagerBase.USER_METADATA_KEY,
        value: ipfsHash,
      },
    ].map((m) => Utils.Metadata.createFromStrings(m.key, m.value));

    const emitAccountMetadataTx = await this._repoDriverTxFactory.emitAccountMetadata(
      accountId,
      accountMetadataAsBytes,
    );

    return [setSplitsTx, emitAccountMetadataTx];
  }

  public async buildBatchTx(context: State): Promise<PopulatedTransaction[]> {
    assert(this._repoDriverTxFactory, `This function requires an active wallet connection.`);

    const { forge, username, repoName } = GitProjectService.deconstructUrl(context.gitUrl);
    const accountId = await this._repoDriverClient.getAccountId(forge, `${username}/${repoName}`);

    const {
      tx: setSplitsTx,
      dependenciesSplitMetadata,
      maintainersSplitsMetadata,
      receivers,
    } = await this._buildSetSplitsTxAndMetadata(
      accountId,
      context.highLevelPercentages,
      context.maintainerSplits,
      context.dependencySplits,
    );

    const project = (await this._gitProjectService.getProjectByUrl(
      context.gitUrl,
    )) as ClaimedGitProject;

    project.emoji = context.projectEmoji;
    project.color = context.projectColor;

    const metadata = this._repoDriverMetadataManager.buildAccountMetadata({
      forProject: project,
      forSplits: {
        dependencies: dependenciesSplitMetadata,
        maintainers: maintainersSplitsMetadata,
      },
    });

    const ipfsHash = await this._repoDriverMetadataManager.pinAccountMetadata(metadata);

    const accountMetadataAsBytes = [
      {
        key: MetadataManagerBase.USER_METADATA_KEY,
        value: ipfsHash,
      },
    ].map((m) => Utils.Metadata.createFromStrings(m.key, m.value));

    const emitAccountMetadataTx = await this._repoDriverTxFactory.emitAccountMetadata(
      accountId,
      accountMetadataAsBytes,
    );

    const splitTxs: Promise<PopulatedTransaction>[] = [];
    context.unclaimedFunds?.map(({ tokenAddress }) => {
      splitTxs.push(
        this._dripsTxFactory.split(accountId, tokenAddress, this._formatSplitReceivers(receivers)),
      );
    });

    return [setSplitsTx, emitAccountMetadataTx, ...(await Promise.all(splitTxs))];
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

  private async _buildSetSplitsTxAndMetadata(
    accountId: string,
    highLevelPercentages: { [slug: string]: number },
    maintainerListEditorConfig: ListEditorConfig,
    dependencyListEditorConfig: ListEditorConfig,
  ) {
    const receivers: SplitsReceiverStruct[] = [];

    // Populate dependencies splits and metadata.
    const dependenciesInput = Object.entries(dependencyListEditorConfig.percentages);

    const dependenciesSplitMetadata: LatestVersion<
      typeof repoDriverAccountMetadataParser
    >['splits']['dependencies'] = [];

    for (const [urlOrAddress, percentage] of dependenciesInput) {
      const isAddr = isAddress(urlOrAddress);

      const weight = Math.floor(
        (Number(percentage) / 100) * 1000000 * (highLevelPercentages['dependencies'] / 100),
      );

      if (weight === 0) continue;

      if (isAddr) {
        const receiver = {
          type: 'address' as const,
          weight,
          accountId: await this._addressDriverClient.getAccountIdByAddress(urlOrAddress as Address),
        };

        dependenciesSplitMetadata.push(receiver);
        receivers.push(receiver);
      } else {
        const { forge, username, repoName } = GitProjectService.deconstructUrl(urlOrAddress);

        const receiver = {
          type: 'repoDriver' as const,
          weight,
          accountId: await this._repoDriverClient.getAccountId(forge, `${username}/${repoName}`),
        };

        dependenciesSplitMetadata.push({
          ...receiver,
          source: populateSource(forge, repoName, username),
        });
        receivers.push(receiver);
      }
    }

    // Populate maintainers splits and metadata.
    const maintainersInput = Object.entries(maintainerListEditorConfig.percentages);

    const maintainersSplitsMetadata: LatestVersion<
      typeof repoDriverAccountMetadataParser
    >['splits']['maintainers'] = [];

    for (const [address, percentage] of maintainersInput) {
      const weight = Math.floor(
        (Number(percentage) / 100) * 1000000 * (highLevelPercentages['maintainers'] / 100),
      );

      if (weight === 0) continue;

      const receiver = {
        type: 'address' as const,
        weight,
        accountId: await this._addressDriverClient.getAccountIdByAddress(address),
      };

      maintainersSplitsMetadata.push(receiver);
      receivers.push(receiver);
    }

    return {
      tx: await this._repoDriverTxFactory.setSplits(
        accountId,
        this._formatSplitReceivers(receivers),
      ),
      dependenciesSplitMetadata,
      maintainersSplitsMetadata,
      receivers,
    };
  }
}
