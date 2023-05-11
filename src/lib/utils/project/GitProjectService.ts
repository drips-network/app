import type { AddressDriverClient, Forge, RepoAccount, RepoDriverClient } from 'radicle-drips';
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
} from '../metadata/types';
import { constants, type ContractTransaction } from 'ethers';
import type { RepoAccountStatus } from './types';

export default class GitProjectService {
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

  public async getByForgeAndRepoName(forge: Forge, repoName: string): Promise<GitProject | null> {
    const userId = await this._repoDriverClient.getUserId(forge, repoName);

    return this._getProject(userId);
  }

  public async getByUserId(userId: UserId): Promise<GitProject | null> {
    return this._getProject(userId);
  }

  private async _getProject(userId: UserId): Promise<GitProject | null> {
    const repoAccount = await this._dripsSubgraphClient.repoDriverQueries.getRepoAccountById(
      userId,
    );

    if (!repoAccount) {
      return null;
    }

    const projectMetadata = await this._repoDriverMetadataManager.fetchAccountMetadata(userId);

    if (!projectMetadata?.data) {
      throw new Error(
        `No metadata found for project with user ID ${userId} but project exists on-chain.`,
      );
    }

    const isClaimed = (await this._repoDriverClient.getOwner(userId)) !== constants.AddressZero;

    this._verifySubgraphAndOnChainStateIsInSync(isClaimed, repoAccount, userId);

    const { color, emoji, description, source } = projectMetadata.data;

    if (!isClaimed) {
      const unclaimedProject: UnclaimedGitProject = {
        source,
        claimed: false,
        owner: undefined,
        repoDriverAccount: {
          driver: 'repo',
          userId: userId,
        },
        verificationStatus: this._calculateVerificationStatus(repoAccount),
      };

      return unclaimedProject;
    }

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
        userId: await this._addressDriverClient.getUserIdByAddress(repoAccount.ownerAddress),
        address: repoAccount.ownerAddress,
      },
    };

    return claimedProject;
  }

  private _verifySubgraphAndOnChainStateIsInSync(
    isClaimed: boolean,
    repoAccount: RepoAccount,
    userId: string,
  ): void {
    if (!isClaimed && repoAccount.status === 'claimed') {
      throw new Error(
        `The repo account with user ID ${userId} is not claimed on-chain (has no owner address set) but has a status of ${repoAccount.status} in the subgraph.
        This means the subgraph is out of sync with the on-chain state.`,
      );
    }

    if (isClaimed && repoAccount.status !== 'claimed') {
      throw new Error(
        `The repo account with user ID ${userId} is claimed on-chain (has an owner address set) but has a status of ${repoAccount.status} in the subgraph. 
        This means the subgraph is out of sync with the on-chain state.`,
      );
    }
  }

  private _calculateVerificationStatus(repoAccount: RepoAccount): VerificationStatus {
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
