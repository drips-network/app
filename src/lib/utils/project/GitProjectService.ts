import {
  Forge,
  AddressDriverClient,
  type RepoAccount,
  type RepoDriverClient,
  RepoDriverTxFactory,
  Utils,
  type SplitsReceiverStruct,
} from 'radicle-drips';
import {
  getAddressDriverClient,
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
  type UserId,
  type Source,
  type AddressDriverSplitReceiver,
  type RepoDriverSplitReceiver,
} from '../metadata/types';
import type { RepoAccountStatus } from './types';
import type { Address } from '../common-types';
import type { z } from 'zod';
import type {
  addressDriverSplitReceiverSchema,
  repoDriverAccountSplitsSchema,
  repoDriverSplitReceiverSchema,
} from '../metadata/schemas';
import relevantTokens from '../drips/relevant-tokens';
import fetchBalancesForTokens from '../drips/fetch-balances-for-tokens';
import seededRandomElement from '../seeded-random-element';
import EMOJI from '$lib/utils/emoji/emoji';
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import { isAddress } from 'ethers/lib/utils';
import type { State } from '../../../routes/app/(flows)/claim-project/claim-project-flow';
import type { ContractTransaction, PopulatedTransaction } from 'ethers';
import { getRepoByUrl as getGithubRepoByUrl } from '../github/github';
import { get } from 'svelte/store';
import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import { isValidGitUrl } from '../is-valid-git-url';

export default class GitProjectService {
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

    const userId = await this._repoDriverClient.getUserId(forge, projectName);

    const onChainProject = await this.getByUserId(userId, shouldVerifyState);

    // If the project doesn't exist on-chain yet, return an unclaimed project.
    if (!onChainProject) {
      const unclaimedProject = {
        claimed: false,
        owner: undefined,
        repoDriverAccount: {
          userId,
          driver: 'repo',
        },
        verificationStatus: 'NOT_STARTED',
        source: GitProjectService.populateSource(forge, repoName, username),
      } as UnclaimedGitProject;

      return unclaimedProject;
    }

    return onChainProject;
  }

  public async getUserIdByUrl(url: string): Promise<UserId> {
    const { forge, username, repoName } = GitProjectService.deconstructUrl(url);
    const projectName = `${username}/${repoName}`;

    return this._repoDriverClient.getUserId(forge, projectName);
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

    const userId = await this._repoDriverClient.getUserId(forge, projectName);

    const tokenAddresses = await Promise.all([relevantTokens('splittable', userId)]);

    const balances = await Promise.all([
      fetchBalancesForTokens('splittable', tokenAddresses[0], userId),
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
   * @param userId The user ID.
   * @param shouldVerifyState Whether to verify the state of the project on-chain and the subgraph is in sync.
   * If you just created the project, you should set this to `false` as it takes a while for the subgraph to index.
   * @returns The on-chain `GitProject`. If the project does not exist on-chain, it returns `null`.
   * @throws if the user ID is invalid.
   */
  public async getByUserId(userId: UserId, shouldVerifyState = true): Promise<GitProject | null> {
    const onChainProject: RepoAccount | null =
      await this._dripsSubgraphClient.repoDriverQueries.getRepoAccountById(userId);

    if (!onChainProject) return null;

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

  private _verifySubgraphAndOnChainStateIsInSync(
    isClaimed: boolean,
    repoAccount: RepoAccount,
    userId: string,
  ): void {
    if (!isClaimed && repoAccount.status === 'CLAIMED') {
      throw new Error(
        `The repo account with user ID ${userId} is not claimed on-chain (has no owner address set) but has a status of ${repoAccount.status} in the subgraph.
        This means the subgraph is out of sync with the on-chain state.`,
      );
    }

    if (isClaimed && repoAccount.status !== 'CLAIMED') {
      throw new Error(
        `The repo account with user ID ${userId} is claimed on-chain (has an owner address set) but has a status of ${repoAccount.status} in the subgraph. 
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

    const { userId } = onChainProject;
    const ownerAddress = await this._repoDriverClient.getOwner(userId);
    const isClaimed = Boolean(ownerAddress);

    if (shouldVerifyState) {
      this._verifySubgraphAndOnChainStateIsInSync(isClaimed, onChainProject, userId);
    }

    const username = onChainProject.name.split('/')[0];
    const repoName = onChainProject.name.split('/')[1];

    // ... and is unclaimed.
    if (!isClaimed) {
      const unclaimedProject: UnclaimedGitProject = {
        claimed: false,
        owner: undefined,
        repoDriverAccount: {
          userId,
          driver: 'repo',
        },
        verificationStatus: this._calculateVerificationStatus(onChainProject),
        source: GitProjectService.populateSource(Number(onChainProject.forge), repoName, username),
      };

      return unclaimedProject;
    }

    // The project exists on-chain and is claimed...

    const projectMetadata = await this._repoDriverMetadataManager.fetchAccountMetadata(userId);

    // Someone could claim a project "manually" without using the Drips app, in which case there won't be any metadata.
    // That's why we need to set default values for color and emoji.
    let description: string | undefined;
    let emoji = seededRandomElement(EMOJI, userId);
    let color = seededRandomElement(['#5555FF', '#53DB53', '#FFC555', '#FF5555'], userId);
    let source = GitProjectService.populateSource(Number(onChainProject.forge), repoName, username);
    let splits: z.infer<typeof repoDriverAccountSplitsSchema> = {
      maintainers: [],
      dependencies: [],
    };

    // ...and has metadata.
    if (projectMetadata?.data) {
      color = projectMetadata.data.color;
      emoji = projectMetadata.data.emoji;
      description = projectMetadata.data.description;
      source = projectMetadata.data.source;
      splits = projectMetadata.data.splits;
    }

    const mapAddressDriverSplitReceiver = (
      metadata: z.infer<typeof addressDriverSplitReceiverSchema>,
    ): AddressDriverSplitReceiver => ({
      weight: metadata.weight,
      account: {
        driver: 'address',
        userId: metadata.userId,
        address: AddressDriverClient.getUserAddress(metadata.userId),
      },
    });

    const mapRepoDriverSplitReceiver = (
      metadata: z.infer<typeof repoDriverSplitReceiverSchema>,
    ): RepoDriverSplitReceiver => ({
      weight: metadata.weight,
      account: {
        driver: 'repo',
        userId: metadata.userId,
      },
      source: metadata.source,
    });

    const claimedProject: ClaimedGitProject = {
      source,
      color,
      emoji,
      description,
      claimed: true,
      repoDriverAccount: {
        driver: 'repo',
        userId: userId,
      },
      owner: {
        driver: 'address',
        address: onChainProject.ownerAddress as Address,
        userId: await this._addressDriverClient.getUserIdByAddress(
          onChainProject.ownerAddress as Address,
        ),
      },
      splits: {
        maintainers: splits.maintainers.map((m) => mapAddressDriverSplitReceiver(m)),
        dependencies: splits.dependencies.map((d) =>
          'source' in d ? mapRepoDriverSplitReceiver(d) : mapAddressDriverSplitReceiver(d),
        ),
      },
    };

    return claimedProject;
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

  public async buildSetSplitsAndEmitMetadataBatchTx(
    context: State,
  ): Promise<PopulatedTransaction[]> {
    assert(this._repoDriverTxFactory, `This function requires an active wallet connection.`);

    const receivers: SplitsReceiverStruct[] = [];

    // Populate dependencies splits and metadata.
    const dependencies: (
      | z.infer<typeof addressDriverSplitReceiverSchema>
      | z.infer<typeof repoDriverSplitReceiverSchema>
    )[] = [];
    for (const [urlOrAddress, percentage] of Object.entries(
      context.dependencySplits.percentages,
    ).filter((d) => context.dependencySplits.selected.includes(d[0]))) {
      const isAddr = isAddress(urlOrAddress);

      if (isAddr) {
        const receiver = {
          weight: Math.floor((Number(percentage) / 100) * 1000000),
          userId: await this._addressDriverClient.getUserIdByAddress(urlOrAddress as Address),
        };

        dependencies.push(receiver);
      } else {
        const { forge, username, repoName } = GitProjectService.deconstructUrl(urlOrAddress);

        dependencies.push({
          weight: Math.floor((Number(percentage) / 100) * 1000000),
          userId: await this._repoDriverClient.getUserId(forge, `${username}/${repoName}`),
          source: GitProjectService.populateSource(forge, repoName, username),
        });
      }
    }

    // Populate maintainers splits and metadata.
    const maintainers: z.infer<typeof addressDriverSplitReceiverSchema>[] = [];
    for (const [address, percentage] of Object.entries(context.maintainerSplits.percentages).filter(
      (d) => context.maintainerSplits.selected.includes(d[0]),
    )) {
      const receiver = {
        weight: Math.floor((Number(percentage) / 100) * 1000000),
        userId: await this._addressDriverClient.getUserIdByAddress(address),
      };

      maintainers.push(receiver);
      receivers.push(receiver);
    }

    const { forge, username, repoName } = GitProjectService.deconstructUrl(context.gitUrl);
    const userId = await this._repoDriverClient.getUserId(forge, `${username}/${repoName}`);
    const setSplitsTx = await this._repoDriverTxFactory.setSplits(userId, receivers);

    const project = (await this.getByUrl(context.gitUrl, false)) as ClaimedGitProject;

    const metadata = this._repoDriverMetadataManager.buildAccountMetadata({
      forProject: project,
      forSplits: {
        dependencies,
        maintainers,
      },
    });

    const ipfsHash = await this._repoDriverMetadataManager.pinAccountMetadata(metadata);

    const userMetadataAsBytes = [
      {
        key: MetadataManagerBase.USER_METADATA_KEY,
        value: ipfsHash,
      },
    ].map((m) => Utils.Metadata.createFromStrings(m.key, m.value));

    const emitUserMetadataTx = await this._repoDriverTxFactory.emitUserMetadata(
      userId,
      userMetadataAsBytes,
    );

    return [setSplitsTx, emitUserMetadataTx];
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
}
