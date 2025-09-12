import RepoDriverMetadataManager from '../metadata/RepoDriverMetadataManager';
import MetadataManagerBase from '../metadata/MetadataManagerBase';
import { get } from 'svelte/store';
import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import type { LatestVersion } from '@efstajas/versioned-parser';
import type { repoDriverAccountMetadataParser } from '../metadata/schemas';
import { Driver, Forge } from '$lib/graphql/__generated__/base-types';
import { toBigInt } from 'ethers';
import type { OxString } from '../sdk/sdk-types';
import {
  populateRepoDriverWriteTx,
} from '../sdk/repo-driver/repo-driver';
import { formatSplitReceivers } from '../sdk/utils/format-split-receivers';
import type { ContractTransaction } from 'ethers';
import { populateDripsWriteTx } from '../sdk/drips/drips';
import keyValueToMetatada from '../sdk/utils/key-value-to-metadata';
import network from '$lib/stores/wallet/network';
import {
  executeRepoSubAccountDriverReadMethod,
  populateRepoSubAccountDriverWriteTx,
} from '../sdk/repo-sub-account-driver/repo-sub-account-driver';
import type Orcid from './entities';
import { fetchOrcid, orcidIdToAccountId } from './fetch-orcid';
import type { State } from '$lib/flows/claim-orcid-flow/claim-orcid-flow';
import type { ListEditorConfig } from '$lib/components/list-editor/types';
import type { MergeWithdrawableBalancesFragment } from '../__generated__/gql.generated';

export default class OrcidTransactionService {
  // private _github!: GitHub;
  private readonly _repoDriverMetadataManager = new RepoDriverMetadataManager();
  private _connectedAddress: string | undefined;

  private constructor() {}

  // TODO: doesn't need to be async?
  public static async new(): Promise<OrcidTransactionService> {
    const orcidTransactionService = new OrcidTransactionService();

    // const octokit = new Octokit();
    // gitProjectService._github = new GitHub(octokit);

    const { connected, signer, address } = get(wallet);

    if (connected) {
      assert(signer, 'Signer address is undefined.');

      orcidTransactionService._connectedAddress = address;
    }

    return orcidTransactionService;
  }

  public async getOrcidInfo(orcid: string): Promise<Orcid> {
    const orcidProfile = await fetchOrcid(orcid, fetch)
    if (!orcidProfile) {
      throw new Error(`Cannot get orcid info`);
    }

    return orcidProfile
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
      // dependencies,
    );

    const repoSubAccountDriverExists = network.contracts.SUB_ACCOUNT_REPO_DRIVER !== undefined;

    let setSubAccountSplitsTx: ContractTransaction | null = null;

    if (repoSubAccountDriverExists) {
      setSubAccountSplitsTx = (
        await this._buildSubAccountSetSplitsTx(accountId, highLevelPercentages, maintainers)
      ).tx;
    }

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

    return {
      batch: [
        ...(setSubAccountSplitsTx ? [setSubAccountSplitsTx] : []),
        setSplitsTx,
        emitAccountMetadataTx,
      ],
      newMetadataHash: ipfsHash,
    };
  }

  public async buildBatchTx(context: State): Promise<ContractTransaction[]> {
    const accountId = (await orcidIdToAccountId(context.claimableId)).toString()

    const {
      tx: setSplitsTx,
      receivers,
    } = await this._buildSetSplitsTxAndMetadata(
      accountId,
      context.highLevelPercentages,
      context.maintainerSplits,
    );

    const repoSubAccountDriverExists = network.contracts.SUB_ACCOUNT_REPO_DRIVER !== undefined;

    let setSubAccountSplitsTx: ContractTransaction | null = null;

    if (repoSubAccountDriverExists) {
      setSubAccountSplitsTx = (
        await this._buildSubAccountSetSplitsTx(
          accountId,
          context.highLevelPercentages,
          context.maintainerSplits,
        )
      ).tx;
    }

    // Create a fake ORCID that adheres to metadata parsing type
    // TODO: Use RepoDriverMetadataManager to construct metadata that
    // adheres to a yet-to-be-introduced structure
    const orcidAccountMetadata = {
      driver: 'repo' as const,
      describes: {
        driver: 'repo' as const,
        accountId,
      },
      source: {
        forge: 'github' as const,
        repoName: 'orcid-account',
        ownerName: context.claimableId,
        url: `https://orcid.org/${context.claimableId}`,
      },
      isVisible: true,
      avatar: {
        type: 'emoji' as const,
        emoji: '👤',
      },
      color: '#16a085',
      description: `ORCID account for ${context.claimableId}`,
      splits: {
        maintainers: [],
        dependencies: [],
      },
      orcid: context.claimableId,
    };

    const ipfsHash = await this._repoDriverMetadataManager.pinAccountMetadata(orcidAccountMetadata);

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


    const splittableAmounts: MergeWithdrawableBalancesFragment[] = []
    const collectableAmounts: MergeWithdrawableBalancesFragment[] = []

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

    return Promise.all([
      ...(setSubAccountSplitsTx ? [setSubAccountSplitsTx] : []),
      setSplitsTx,
      emitAccountMetadataTx,
      ...splitTxs,
      ...collectTxs,
    ]);
  }

  private _adjustWeights<T extends { weight: number }>(input: T[]): T[] {
    // Adjust weights to ensure no tiny remainder
    const MAX_WEIGHT = 1000000;

    const totalWeight = input.reduce((acc, { weight }) => acc + weight, 0);
    const remainder = MAX_WEIGHT - totalWeight;

    if (remainder > 0) {
      input[0].weight += remainder;
    }

    return input;
  }

  private async _buildSubAccountSetSplitsTx(
    accountId: string,
    highLevelPercentages: { [slug: string]: number },
    maintainerListEditorConfig: ListEditorConfig,
  ) {
    const subDriverAccountId = (
      await executeRepoSubAccountDriverReadMethod({
        functionName: 'calcAccountId',
        args: [BigInt(accountId)],
      })
    ).toString();

    const receivers: (LatestVersion<
      typeof repoDriverAccountMetadataParser
    >['splits']['maintainers'][number] & { sublist: 'maintainers' })[] = [];

    for (const [accountId, weight] of Object.entries(maintainerListEditorConfig.weights)) {
      const scaledWeight = Math.floor(
        Math.floor(weight * (highLevelPercentages['maintainers'] / 100)),
      );

      if (scaledWeight === 0) continue;

      const receiver = {
        sublist: 'maintainers' as const,
        type: 'address' as const,
        weight: scaledWeight,
        accountId,
      };

      receivers.push(receiver);
    }

    this._adjustWeights(receivers);

    return {
      tx: await populateRepoSubAccountDriverWriteTx({
        functionName: 'setSplits',
        args: [toBigInt(subDriverAccountId), formatSplitReceivers(receivers)],
      }),
      receivers,
    };
  }

  private async _buildSetSplitsTxAndMetadata(
    accountId: string,
    highLevelPercentages: { [slug: string]: number },
    maintainerListEditorConfig: ListEditorConfig,
  ) {
    const receivers: ((
      | LatestVersion<typeof repoDriverAccountMetadataParser>['splits']['maintainers'][number]
      | LatestVersion<typeof repoDriverAccountMetadataParser>['splits']['dependencies'][number]
    ) & { sublist: 'dependencies' | 'maintainers' })[] = [];

    for (const [accountId, weight] of Object.entries(maintainerListEditorConfig.weights)) {
      const scaledWeight = Math.floor(
        Math.floor(weight * (highLevelPercentages['maintainers'] / 100)),
      );

      if (scaledWeight === 0) continue;

      const receiver = {
        sublist: 'maintainers' as const,
        type: 'address' as const,
        weight: scaledWeight,
        accountId,
      };

      receivers.push(receiver);
    }

    this._adjustWeights(receivers);

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
}
