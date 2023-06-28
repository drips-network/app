import { Forge, AddressDriverClient, type RepoAccount, type RepoDriverClient } from 'radicle-drips';
import {
  getAddressDriverClient,
  getRepoDriverClient,
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
import type { ContractTransaction } from 'ethers';
import type { RepoAccountStatus } from './types';
import isValidGitUrl from '../is-valid-git-url';
import type { Address } from '../common-types';
import type { z } from 'zod';
import type {
  addressDriverSplitReceiverSchema,
  repoDriverAccountSplitsSchema,
  repoDriverSplitReceiverSchema,
} from '../metadata/schemas';

export default class GitProjectService {
  private static readonly DEFAULT_COLOR = '#5555FF';
  private static readonly DEFAULT_EMOJI = '?';

  private _repoDriverClient!: RepoDriverClient;
  private _addressDriverClient!: AddressDriverClient;
  private readonly _dripsSubgraphClient = getSubgraphClient();
  private readonly _repoDriverMetadataManager = new RepoDriverMetadataManager();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static async new(): Promise<GitProjectService> {
    const gitProjectService = new GitProjectService();

    gitProjectService._repoDriverClient = await getRepoDriverClient();
    gitProjectService._addressDriverClient = await getAddressDriverClient();

    return gitProjectService;
  }

  public async requestOwnerUpdate(forge: Forge, repoName: string): Promise<ContractTransaction> {
    return this._repoDriverClient.requestOwnerUpdate(forge, repoName);
  }
  /**
   * Returns the `GitProject` for the given URL.
   * @param url The git URL.
   * @returns The on-chain `GitProject`. If the project does not exist on-chain, it returns an `UnclaimedGitProject`.
   * @throws if the URL is invalid.
   */
  public async getByUrl(url: string): Promise<GitProject> {
    if (!isValidGitUrl(url)) {
      throw new Error(`Invalid git URL: ${url}`);
    }

    const { forge, username, repoName } = GitProjectService.deconstructUrl(url);
    const projectName = `${username}/${repoName}`;

    const userId = await this._repoDriverClient.getUserId(forge, projectName);

    const onChainProject = await this.getByUserId(userId);

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

  public async getAllByOwner(address: Address): Promise<ClaimedGitProject[]> {
    const res = await this._dripsSubgraphClient.repoDriverQueries.getRepoAccountsOwnedByAddress(
      address,
    );

    const promises = res.map((r) => this._mapRepoAccountToGitProject(r));

    return (await Promise.all(promises)).filter(
      (a): a is ClaimedGitProject => a !== null && Boolean(a.owner),
    );
  }

  public static deconstructUrl(url: string): {
    forge: Forge;
    username: string;
    repoName: string;
  } {
    const parsedURL = new URL(url);

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

  public async getByUserId(userId: UserId): Promise<GitProject | null> {
    const onChainProject: RepoAccount | null =
      await this._dripsSubgraphClient.repoDriverQueries.getRepoAccountById(userId);

    if (!onChainProject) return null;

    return await this._mapRepoAccountToGitProject(onChainProject);
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
  ): Promise<GitProject | null> {
    // The project doesn't exist on-chain.
    if (!onChainProject) {
      return null;
    }

    // The project exists on-chain...

    const { userId } = onChainProject;
    const ownerAddress = await this._repoDriverClient.getOwner(userId);
    const isClaimed = Boolean(ownerAddress);

    this._verifySubgraphAndOnChainStateIsInSync(isClaimed, onChainProject, userId);

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
    let color = GitProjectService.DEFAULT_COLOR;
    let emoji = GitProjectService.DEFAULT_EMOJI;
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

  private _calculateVerificationStatus(repoAccount: RepoAccount): VerificationStatus {
    if (!repoAccount.status) {
      return VerificationStatus.NOT_STARTED;
    }

    const haveFiveMinutesPassed = (utcTimestamp: bigint): boolean => {
      const FIVE_MINUTES_IN_MS = BigInt(5n * 60n * 1000n);
      const now = BigInt(Date.now());

      return now - BigInt(utcTimestamp) >= FIVE_MINUTES_IN_MS;
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
