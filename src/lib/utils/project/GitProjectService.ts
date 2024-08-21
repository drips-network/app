import RepoDriverMetadataManager from '../metadata/RepoDriverMetadataManager';
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import type { State } from '$lib/flows/claim-project-flow/claim-project-flow';
import { get } from 'svelte/store';
import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import type { LatestVersion } from '@efstajas/versioned-parser';
import type { repoDriverAccountMetadataParser } from '../metadata/schemas';
import { Driver, Forge } from '$lib/graphql/__generated__/base-types';
import GitHub from '../github/GitHub';
import { Octokit } from '@octokit/rest';
import type { Items, Weights } from '$lib/components/list-editor/types';
import { hexlify, toBigInt, toUtf8Bytes } from 'ethers';
import type { OxString } from '../sdk/sdk-types';
import {
  populateRepoDriverWriteTx,
  executeRepoDriverReadMethod,
} from '../sdk/repo-driver/repo-driver';
import { formatSplitReceivers } from '../sdk/utils/format-split-receivers';
import type { ContractTransaction } from 'ethers';
import { populateDripsWriteTx } from '../sdk/drips/drips';
import keyValueToMetatada from '../sdk/utils/key-value-to-metadata';
import filterCurrentChainData from '../filter-current-chain-data';
import unreachable from '../unreachable';
import network from '$lib/stores/wallet/network';

interface ListEditorConfig {
  items: Items;
  weights: Weights;
}

export default class GitProjectService {
  private _github!: GitHub;
  private readonly _repoDriverMetadataManager = new RepoDriverMetadataManager();
  private _connectedAddress: string | undefined;

  private constructor() {}

  public static async new(): Promise<GitProjectService> {
    const gitProjectService = new GitProjectService();

    const octokit = new Octokit();
    gitProjectService._github = new GitHub(octokit);

    const { connected, signer, address } = get(wallet);

    if (connected) {
      assert(signer, 'Signer address is undefined.');

      gitProjectService._connectedAddress = address;
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
  ): Promise<{ newMetadataHash: string; batch: ContractTransaction[] }> {
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

    const upgraded = this._repoDriverMetadataManager.upgradeAccountMetadata(currentMetadata.data);

    const newMetadata = {
      ...upgraded,
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
    ].map(keyValueToMetatada);

    const emitAccountMetadataTx = await populateRepoDriverWriteTx({
      functionName: 'emitAccountMetadata',
      args: [toBigInt(accountId), accountMetadataAsBytes],
    });

    return { batch: [setSplitsTx, emitAccountMetadataTx], newMetadataHash: ipfsHash };
  }

  public async buildBatchTx(context: State): Promise<ContractTransaction[]> {
    const { forge, username, repoName } = GitProjectService.deconstructUrl(context.gitUrl);

    const accountId = (
      await executeRepoDriverReadMethod({
        functionName: 'calcAccountId',
        args: [
          forge === Forge.GitHub ? 0 : unreachable(),
          hexlify(toUtf8Bytes(`${username}/${repoName}`)) as OxString,
        ], // TODO: Change hard-coded Forge logic to dynamic when other forges are supported.
      })
    ).toString();

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
      __typename: 'Project' as const,
      account: {
        __typename: 'RepoDriverAccount' as const,
        accountId,
        driver: Driver.Repo,
      },
      source: {
        __typename: 'Source' as const,
        forge: forge,
        ownerName: username,
        repoName: repoName,
        url: context.gitUrl,
      },
      chainData: {
        __typename: 'ClaimedProjectData',
        chain: network.gqlName,
        color: context.projectColor,
        avatar:
          context.avatar.type === 'emoji'
            ? {
                __typename: 'EmojiAvatar' as const,
                emoji: context.avatar.emoji,
              }
            : {
                __typename: 'ImageAvatar' as const,
                cid: context.avatar.cid,
              },
      },
    };

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
    ].map(keyValueToMetatada);

    const emitAccountMetadataTx = await populateRepoDriverWriteTx({
      functionName: 'emitAccountMetadata',
      args: [toBigInt(accountId), accountMetadataAsBytes],
    });

    const projectChainData = context.project?.chainData
      ? filterCurrentChainData(context.project.chainData)
      : unreachable();

    const splittableAmounts =
      'withdrawableBalances' in projectChainData
        ? projectChainData.withdrawableBalances.filter((wb) => BigInt(wb.splittableAmount) > 0n)
        : undefined;
    const collectableAmounts =
      'withdrawableBalances' in projectChainData
        ? projectChainData.withdrawableBalances.filter((wb) => BigInt(wb.collectableAmount) > 0n)
        : undefined;

    const splitTxs: Promise<ContractTransaction>[] = [];
    splittableAmounts?.forEach(({ tokenAddress }) => {
      splitTxs.push(
        populateDripsWriteTx({
          functionName: 'split',
          args: [toBigInt(accountId), tokenAddress as OxString, formatSplitReceivers(receivers)],
        }),
      );
    });

    const collectTxs: Promise<ContractTransaction>[] = [];
    collectableAmounts?.forEach(({ tokenAddress }) => {
      assert(this._connectedAddress);

      collectTxs.push(
        populateRepoDriverWriteTx({
          functionName: 'collect',
          args: [toBigInt(accountId), tokenAddress as OxString, this._connectedAddress as OxString],
        }),
      );
    });

    return Promise.all([setSplitsTx, emitAccountMetadataTx, ...splitTxs, ...collectTxs]);
  }

  private async _buildSetSplitsTxAndMetadata(
    accountId: string,
    highLevelPercentages: { [slug: string]: number },
    maintainerListEditorConfig: ListEditorConfig,
    dependencyListEditorConfig: ListEditorConfig,
  ) {
    let receivers: ((
      | LatestVersion<typeof repoDriverAccountMetadataParser>['splits']['maintainers'][number]
      | LatestVersion<typeof repoDriverAccountMetadataParser>['splits']['dependencies'][number]
    ) & { sublist: 'dependencies' | 'maintainers' })[] = [];

    for (const [accountId, weight] of Object.entries(dependencyListEditorConfig.weights)) {
      const item = dependencyListEditorConfig.items[accountId];
      if (weight === 0) continue;

      const scaledWeight = Math.floor(
        Math.floor(weight * (highLevelPercentages['dependencies'] / 100)),
      );

      switch (item.type) {
        case 'address': {
          const receiver = {
            sublist: 'dependencies' as const,
            type: 'address' as const,
            weight: scaledWeight,
            accountId: accountId,
          };

          receivers.push(receiver);
          break;
        }
        case 'drip-list': {
          const receiver = {
            sublist: 'dependencies' as const,
            type: 'dripList' as const,
            weight: scaledWeight,
            accountId: accountId,
          };

          receivers.push(receiver);
          break;
        }
        case 'project': {
          const receiver = {
            sublist: 'dependencies' as const,
            type: 'repoDriver' as const,
            weight: scaledWeight,
            accountId: accountId,
            source: GitProjectService.populateSource(
              item.project.source.forge,
              item.project.source.repoName,
              item.project.source.ownerName,
            ),
          };

          receivers.push(receiver);
          break;
        }
      }
    }

    for (const [accountId, weight] of Object.entries(maintainerListEditorConfig.weights)) {
      if (weight === 0) continue;

      const scaledWeight = Math.floor(
        Math.floor(weight * (highLevelPercentages['maintainers'] / 100)),
      );

      const receiver = {
        sublist: 'maintainers' as const,
        type: 'address' as const,
        weight: scaledWeight,
        accountId,
      };

      receivers.push(receiver);
    }

    // Adjust weights to ensure no tiny remainder
    const MAX_WEIGHT = 1000000;

    function adjustWeights<T extends { weight: number }>(input: T[]): T[] {
      const totalWeight = input.reduce((acc, { weight }) => acc + weight, 0);
      const remainder = MAX_WEIGHT - totalWeight;

      if (remainder > 0) {
        input[0].weight += remainder;
      }

      return input;
    }

    receivers = adjustWeights(receivers);

    return {
      tx: await populateRepoDriverWriteTx({
        functionName: 'setSplits',
        args: [toBigInt(accountId), formatSplitReceivers(receivers)],
      }),
      dependenciesSplitMetadata: receivers.filter((v) => v.sublist === 'dependencies'),
      maintainersSplitsMetadata: receivers.filter(
        (v) => v.sublist === 'maintainers',
      ) as LatestVersion<typeof repoDriverAccountMetadataParser>['splits']['maintainers'],
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
