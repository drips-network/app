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
  getSubgraphClient,
} from '../get-drips-clients';
import RepoDriverMetadataManager from '../metadata/RepoDriverMetadataManager';
import type { Address } from '../common-types';
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import { isAddress } from 'ethers/lib/utils';
import type { State } from '../../../routes/app/(flows)/claim-project/claim-project-flow';
import { BigNumber, type PopulatedTransaction } from 'ethers';
import { get } from 'svelte/store';
import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import { isValidGitUrl } from '../is-valid-git-url';
import type { ListEditorConfig } from '$lib/components/drip-list-members-editor/drip-list-members-editor.svelte';
import type { LatestVersion } from '@efstajas/versioned-parser/lib/types';
import type { repoDriverAccountMetadataParser } from '../metadata/schemas';
import { Driver, Forge } from '$lib/graphql/__generated__/base-types';
import GitHub from '../github/GitHub';
import { Octokit } from '@octokit/rest';

export default class GitProjectService {
  private _github!: GitHub;
  private _dripsTxFactory!: DripsTxFactory;
  private _repoDriverClient!: RepoDriverClient;
  private _repoDriverTxFactory!: RepoDriverTxFactory;
  private _addressDriverClient!: AddressDriverClient;
  private readonly _dripsSubgraphClient = getSubgraphClient();
  private readonly _repoDriverMetadataManager = new RepoDriverMetadataManager();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static async new(): Promise<GitProjectService> {
    const gitProjectService = new GitProjectService();

    const octokit = new Octokit();
    gitProjectService._github = new GitHub(octokit);

    gitProjectService._repoDriverClient = await getRepoDriverClient();
    gitProjectService._addressDriverClient = await getAddressDriverClient();
    gitProjectService._dripsTxFactory = await getDripsTxFactory();

    const { connected, signer } = get(wallet);

    if (connected) {
      assert(signer, 'Signer address is undefined.');

      gitProjectService._repoDriverTxFactory = await getRepoDriverTxFactory();
    }

    return gitProjectService;
  }

  public static deconstructUrl(url: string): {
    forge: Forge;
    username: string;
    repoName: string;
  } {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // If URL ends with /, remove it
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    const parsedURL = new URL(url);

    // TODO: support more forges.
    let forge: Forge;
    switch (parsedURL.hostname) {
      case 'github.com':
        forge = Forge.GitHub;
        break;
      default:
        throw new Error(`Unsupported hostname: ${parsedURL.hostname}`);
    }

    const name = parsedURL.pathname.startsWith('/')
      ? parsedURL.pathname.slice(1)
      : parsedURL.pathname;
    const [username, repoName] = name.split('/');

    return { forge, username, repoName };
  }

  public static populateSource(
    forge: Forge,
    repoName: string,
    username: string,
  ): LatestVersion<typeof repoDriverAccountMetadataParser>['source'] {
    let url: string;

    switch (forge) {
      case Forge.GitHub:
        url = `https://github.com/${username}/${repoName}`;
        break;
      default:
        throw new Error(`Unsupported forge: ${forge}`);
    }

    switch (forge) {
      case Forge.GitHub:
        return {
          url,
          repoName,
          forge: 'github',
          ownerName: username,
        };
      default:
        throw new Error(`Unsupported forge: ${forge}`);
    }
  }

  public async getProjectInfo(url: string): Promise<{
    description: string | null;
    defaultBranch: string | null;
    starsCount: number;
    forksCount: number;
  }> {
    const forge = this._getForge(url);

    if (forge === Forge.GitHub) {
      const {
        description,
        forks_count: forksCount,
        stargazers_count: starsCount,
        default_branch: defaultBranch,
      } = await this._github.getRepoByUrl(url);

      return {
        forksCount,
        starsCount,
        description,
        defaultBranch,
      };
    } else {
      throw new Error(`Cannot get project info: unsupported forge: ${forge}`);
    }
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
    const numericForgeValue = forge === Forge.GitHub ? 0 : 1;
    const accountId = await this._repoDriverClient.getAccountId(
      numericForgeValue,
      `${username}/${repoName}`,
    );

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

    const project = {
      __typename: 'ClaimedProject' as const,
      account: {
        __typename: 'RepoDriverAccount' as const,
        accountId,
        driver: Driver.Repo,
      },
      color: context.projectColor,
      emoji: context.projectEmoji,
      source: {
        __typename: 'Source' as const,
        forge: forge,
        ownerName: username,
        repoName: repoName,
        url: context.gitUrl,
      },
    };

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

    for (const [itemId, percentage] of dependenciesInput) {
      const isAddr = isAddress(itemId);

      const weight = Math.floor(
        (Number(percentage) / 100) * 1000000 * (highLevelPercentages['dependencies'] / 100),
      );

      if (weight === 0) continue;

      if (isAddr) {
        const receiver = {
          type: 'address' as const,
          weight,
          accountId: await this._addressDriverClient.getAccountIdByAddress(itemId as Address),
        };

        dependenciesSplitMetadata.push(receiver);
        receivers.push(receiver);
      } else if (isValidGitUrl(itemId)) {
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

        dependenciesSplitMetadata.push({
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

        dependenciesSplitMetadata.push(receiver);
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

  private _getForge(url: string): Forge {
    const parsedURL = new URL(url);

    switch (parsedURL.hostname) {
      case 'github.com':
        return Forge.GitHub;
      default:
        throw new Error(`Unsupported hostname: ${parsedURL.hostname}`);
    }
  }
}
