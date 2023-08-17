import {
  Forge,
  AddressDriverClient,
  type RepoAccount,
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
import {
  VerificationStatus,
  type ClaimedGitProject,
  type GitProject,
  type UnclaimedGitProject,
  type AccountId,
  type Source,
  type AddressDriverSplitReceiver,
  type RepoDriverSplitReceiver,
} from '../metadata/types';
import type { RepoAccountStatus } from './types';
import type { Address } from '../common-types';
import type { z } from 'zod';
import type {
  addressDriverSplitReceiverSchema,
  repoDriverSplitReceiverSchema,
} from '../metadata/schemas';
import relevantTokens from '../drips/relevant-tokens';
import fetchBalancesForTokens from '../drips/fetch-balances-for-tokens';
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import { isAddress } from 'ethers/lib/utils';
import type { State } from '../../../routes/app/(flows)/claim-project/claim-project-flow';
import { BigNumber, type ContractTransaction, type PopulatedTransaction } from 'ethers';
import { getRepoByUrl as getGithubRepoByUrl } from '../github/github';
import { get } from 'svelte/store';
import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import { isValidGitUrl } from '../is-valid-git-url';
import type { ListEditorConfig } from '$lib/components/list-editor/list-editor.svelte';

// TODO: there is some duplication between this class and `DripListService` for mapping splits. To refactor.
export default class GitProjectService {
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

  /**
   * Returns the `GitProject` for the given URL.
   * @param url The git URL.
   * @param shouldVerifyState Whether to verify the state of the project on-chain and the subgraph is in sync.
   * If you just created the project, you should set this to `false` as it takes a while for the subgraph to index.
   * @returns The on-chain `GitProject`. If the project does not exist on-chain, it returns an `UnclaimedGitProject`.
   * @throws if the URL is invalid.
   */
  public async getByUrl(url: string, shouldVerifyState = true): Promise<GitProject> {
    if (!isValidGitUrl(url)) {
      throw new Error(`Invalid git URL: ${url}`);
    }

    const { forge, username, repoName } = GitProjectService.deconstructUrl(url);
    const projectName = `${username}/${repoName}`;

    const accountId = await this._repoDriverClient.getAccountId(forge, projectName);

    const onChainProject = await this.getByAccountId(accountId, shouldVerifyState);

    // If the project doesn't exist on-chain yet, return an unclaimed project.
    if (!onChainProject) {
      const unclaimedProject = {
        claimed: false,
        owner: undefined,
        repoDriverAccount: {
          accountId,
          driver: 'repo',
        },
        verificationStatus: 'NOT_STARTED',
        source: GitProjectService.populateSource(forge, repoName, username),
      } as UnclaimedGitProject;

      return unclaimedProject;
    }

    return onChainProject;
  }

  public async getAccountIdByUrl(url: string): Promise<AccountId> {
    const { forge, username, repoName } = GitProjectService.deconstructUrl(url);
    const projectName = `${username}/${repoName}`;

    return this._repoDriverClient.getAccountId(forge, projectName);
  }

  public async getAllByOwner(address: Address): Promise<ClaimedGitProject[]> {
    const res = await this._dripsSubgraphClient.repoDriverQueries.getRepoAccountsOwnedByAddress(
      address,
    );

    const promises = res.map((r) => this._mapRepoAccountToGitProject(r));

    return (await Promise.all(promises)).filter(
      (a): a is ClaimedGitProject => a !== null && Boolean(a.owner),
    );
  }

  // TODO: use `unclaimed-funds.ts` when merged.
  public async getUnclaimedFunds(url: string): Promise<
    {
      tokenAddress: string;
      amount: bigint;
    }[]
  > {
    const { forge, username, repoName } = GitProjectService.deconstructUrl(url);
    const projectName = `${username}/${repoName}`;

    const accountId = await this._repoDriverClient.getAccountId(forge, projectName);

    const tokenAddresses = await Promise.all([relevantTokens('splittable', accountId)]);

    const balances = await Promise.all([
      fetchBalancesForTokens('splittable', tokenAddresses[0], accountId),
    ]);

    return balances[0].map((b) => ({
      tokenAddress: b.tokenAddress,
      amount: b.splittableAmount,
    }));
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

  /**
   * Returns the `GitProject` for the given user ID.
   * @param accountId The user ID.
   * @param shouldVerifyState Whether to verify the state of the project on-chain and the subgraph is in sync.
   * If you just created the project, you should set this to `false` as it takes a while for the subgraph to index.
   * @returns The on-chain `GitProject`. If the project does not exist on-chain, it returns `null`.
   * @throws if the user ID is invalid.
   */
  public async getByAccountId(
    accountId: AccountId,
    shouldVerifyState = true,
    source: Source | null = null,
  ): Promise<GitProject | null> {
    const onChainProject: RepoAccount | null =
      await this._dripsSubgraphClient.repoDriverQueries.getRepoAccountById(accountId);

    // If the project doesn't exist on-chain yet, return an unclaimed project.
    if (!onChainProject) {
      if (!source) return null;

      // TODO: Don't hardcode Forge.GitHub
      const { forge, username, repoName } = GitProjectService.deconstructUrl(source.url);

      const accountIdForSource = await this._repoDriverClient.getAccountId(
        forge,
        `${username}/${repoName}`,
      );
      assert(
        accountId === accountIdForSource,
        `The account ID ${accountId} does not match the account ID ${accountIdForSource} for the source ${source}.`,
      );

      const unclaimedProject = {
        claimed: false,
        owner: undefined,
        repoDriverAccount: {
          accountId,
          driver: 'repo',
        },
        verificationStatus: 'NOT_STARTED',
        source,
      } as UnclaimedGitProject;

      return unclaimedProject;
    }

    return await this._mapRepoAccountToGitProject(onChainProject, shouldVerifyState);
  }

  public static populateSource(forge: Forge, repoName: string, username: string): Source {
    let url: string;

    switch (forge) {
      case Forge.GitHub:
        url = `https://github.com/${username}/${repoName}`;
        break;
      default:
        throw new Error(`Unsupported forge: ${forge}`);
    }

    // TODO: support more forges.
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
      } = await getGithubRepoByUrl(url);

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

    const project = (await this.getByUrl(context.gitUrl, false)) as ClaimedGitProject;

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
      splitTxs.push(this._dripsTxFactory.split(accountId, tokenAddress, receivers));
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
    const dependenciesInput = Object.entries(dependencyListEditorConfig.percentages).filter((d) =>
      dependencyListEditorConfig.selected.includes(d[0]),
    );

    const dependenciesSplitMetadata: (
      | z.infer<typeof addressDriverSplitReceiverSchema>
      | z.infer<typeof repoDriverSplitReceiverSchema>
    )[] = [];

    for (const [urlOrAddress, percentage] of dependenciesInput) {
      const isAddr = isAddress(urlOrAddress);

      const weight = Math.floor(
        (Number(percentage) / 100) * 1000000 * (highLevelPercentages['dependencies'] / 100),
      );

      if (weight === 0) continue;

      if (isAddr) {
        const receiver = {
          weight,
          accountId: await this._addressDriverClient.getAccountIdByAddress(urlOrAddress as Address),
        };

        dependenciesSplitMetadata.push(receiver);
        receivers.push(receiver);
      } else {
        const { forge, username, repoName } = GitProjectService.deconstructUrl(urlOrAddress);

        const receiver = {
          weight,
          accountId: await this._repoDriverClient.getAccountId(forge, `${username}/${repoName}`),
        };

        dependenciesSplitMetadata.push({
          ...receiver,
          source: GitProjectService.populateSource(forge, repoName, username),
        });
        receivers.push(receiver);
      }
    }

    // Populate maintainers splits and metadata.
    const maintainersInput = Object.entries(maintainerListEditorConfig.percentages).filter((d) =>
      maintainerListEditorConfig.selected.includes(d[0]),
    );

    const maintainersSplitsMetadata: z.infer<typeof addressDriverSplitReceiverSchema>[] = [];

    for (const [address, percentage] of maintainersInput) {
      const weight = Math.floor(
        (Number(percentage) / 100) * 1000000 * (highLevelPercentages['maintainers'] / 100),
      );

      if (weight === 0) continue;

      const receiver = {
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

  private _calculateVerificationStatus(repoAccount: RepoAccount): VerificationStatus {
    if (!repoAccount.status) {
      return VerificationStatus.NOT_STARTED;
    }

    const haveFiveMinutesPassed = (utcTimestamp: bigint): boolean => {
      const FIVE_MINUTES_IN_MS = BigInt(5n * 60n * 1000n);
      const now = BigInt(Date.now());

      return now - BigInt(utcTimestamp * 1000n) >= FIVE_MINUTES_IN_MS;
    };

    let verificationStatus: VerificationStatus;

    if ((repoAccount.status as RepoAccountStatus) === 'claimed') {
      throw new Error('Repo account status should not be claimed at this point.');
    } else if ((repoAccount.status as RepoAccountStatus) === 'not-started') {
      verificationStatus = VerificationStatus.NOT_STARTED;
    } else {
      if (haveFiveMinutesPassed(repoAccount.lastUpdatedBlockTimestamp)) {
        verificationStatus = VerificationStatus.FAILED;
      } else {
        verificationStatus = VerificationStatus.IN_PROGRESS;
      }
    }

    return verificationStatus;
  }

  private _verifySubgraphAndOnChainStateIsInSync(
    isClaimed: boolean,
    repoAccount: RepoAccount,
    accountId: string,
  ): void {
    if (!isClaimed && repoAccount.status === 'CLAIMED') {
      throw new Error(
        `The repo account with user ID ${accountId} is not claimed on-chain (has no owner address set) but has a status of ${repoAccount.status} in the subgraph.
        This means the subgraph is out of sync with the on-chain state.`,
      );
    }

    if (isClaimed && repoAccount.status !== 'CLAIMED') {
      throw new Error(
        `The repo account with user ID ${accountId} is claimed on-chain (has an owner address set) but has a status of ${repoAccount.status} in the subgraph. 
        This means the subgraph is out of sync with the on-chain state.`,
      );
    }
  }

  private async _mapRepoAccountToGitProject(
    onChainProject: RepoAccount,
    shouldVerifyState = true,
  ): Promise<GitProject | null> {
    // The project doesn't exist on-chain.
    if (!onChainProject) {
      return null;
    }

    // The project exists on-chain...

    const { accountId } = onChainProject;
    const ownerAddress = await this._repoDriverClient.getOwner(accountId);
    const isClaimed = Boolean(ownerAddress);

    if (shouldVerifyState) {
      this._verifySubgraphAndOnChainStateIsInSync(isClaimed, onChainProject, accountId);
    }

    const username = onChainProject.name.split('/')[0];
    const repoName = onChainProject.name.split('/')[1];

    // ... and is unclaimed.
    if (!isClaimed) {
      const unclaimedProject: UnclaimedGitProject = {
        claimed: false,
        owner: undefined,
        repoDriverAccount: {
          accountId,
          driver: 'repo',
        },
        verificationStatus: this._calculateVerificationStatus(onChainProject),
        source: GitProjectService.populateSource(Number(onChainProject.forge), repoName, username),
      };

      return unclaimedProject;
    }

    // The project exists on-chain and is claimed...

    const projectMetadata = await this._repoDriverMetadataManager.fetchAccountMetadata(accountId);

    // ...and hasn't metadata. Return as unclaimed project.
    if (!projectMetadata) {
      const unclaimedProject: UnclaimedGitProject = {
        claimed: false,
        owner: undefined,
        repoDriverAccount: {
          accountId,
          driver: 'repo',
        },
        verificationStatus: VerificationStatus.FINISHED,
        source: GitProjectService.populateSource(Number(onChainProject.forge), repoName, username),
      };

      return unclaimedProject;
    }

    // ...and has metadata. Return a claimed project.

    const mapAddressDriverSplitReceiver = (
      metadata: z.infer<typeof addressDriverSplitReceiverSchema>,
    ): AddressDriverSplitReceiver => ({
      type: 'address',
      weight: metadata.weight,
      account: {
        driver: 'address',
        accountId: metadata.accountId,
        address: AddressDriverClient.getUserAddress(metadata.accountId),
      },
    });

    const mapRepoDriverSplitReceiver = (
      metadata: z.infer<typeof repoDriverSplitReceiverSchema>,
    ): RepoDriverSplitReceiver => ({
      type: 'repo',
      weight: metadata.weight,
      account: {
        driver: 'repo',
        accountId: metadata.accountId,
      },
      source: metadata.source,
    });

    const claimedProject: ClaimedGitProject = {
      source: projectMetadata.data.source,
      color: projectMetadata.data.color,
      emoji: projectMetadata.data.emoji,
      description: projectMetadata.data.description,
      claimed: true,
      repoDriverAccount: {
        driver: 'repo',
        accountId: accountId,
      },
      owner: {
        driver: 'address',
        address: onChainProject.ownerAddress as Address,
        accountId: await this._addressDriverClient.getAccountIdByAddress(
          onChainProject.ownerAddress as Address,
        ),
      },
      splits: {
        maintainers: projectMetadata.data.splits.maintainers.map((m) =>
          mapAddressDriverSplitReceiver(m),
        ),
        dependencies: projectMetadata.data.splits.dependencies.map((d) =>
          'source' in d ? mapRepoDriverSplitReceiver(d) : mapAddressDriverSplitReceiver(d),
        ),
      },
    };

    return claimedProject;
  }
}
