import RepoDriverMetadataManager from '../metadata/RepoDriverMetadataManager';
import { get } from 'svelte/store';
import wallet from '$lib/stores/wallet/wallet.store';
import assert from '$lib/utils/assert';
import type { LatestVersion } from '@efstajas/versioned-parser';
import type { repoDriverAccountMetadataParser } from '../metadata/schemas';
import { toBigInt } from 'ethers';
import type { OxString } from '../sdk/sdk-types';
import { populateRepoDriverWriteTx } from '../sdk/repo-driver/repo-driver';
import { formatSplitReceivers } from '../sdk/utils/format-split-receivers';
import type { ContractTransaction } from 'ethers';
import network from '$lib/stores/wallet/network';
import {
  executeRepoSubAccountDriverReadMethod,
  populateRepoSubAccountDriverWriteTx,
} from '../sdk/repo-sub-account-driver/repo-sub-account-driver';
import type Orcid from './entities';
import { fetchOrcid, orcidIdToAccountId } from './fetch-orcid';
import type { State } from '$lib/flows/claim-orcid-flow/claim-orcid-flow';
import type { ListEditorConfig } from '$lib/components/list-editor/types';
import { populateDripsWriteTx } from '../sdk/drips/drips';

// TODO: constructor doesn't need to be
// TOOD: we know what the splits need to be in advance, remove their "calculation"
// here.
// TODO: rename to something more apropriate
export default class OrcidTransactionService {
  private readonly _repoDriverMetadataManager = new RepoDriverMetadataManager();
  private _connectedAddress: string | undefined;

  private constructor() {}

  public static async new(): Promise<OrcidTransactionService> {
    const orcidTransactionService = new OrcidTransactionService();

    const { connected, signer, address } = get(wallet);

    if (connected) {
      assert(signer, 'Signer address is undefined.');

      orcidTransactionService._connectedAddress = address;
    }

    return orcidTransactionService;
  }

  public async getOrcidInfo(orcid: string): Promise<Orcid> {
    const orcidProfile = await fetchOrcid(orcid, fetch);
    if (!orcidProfile) {
      throw new Error(`Cannot get orcid info`);
    }

    return orcidProfile;
  }

  public async buildUpdateSplitsBatchTx(
    accountId: string,
    highLevelPercentages: { [slug: string]: number },
    maintainers: ListEditorConfig,
    // dependencies: ListEditorConfig,
  ): Promise<{ batch: ContractTransaction[] }> {
    const {
      tx: setSplitsTx,
      // dependenciesSplitMetadata,
      // maintainersSplitsMetadata,
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

    return {
      batch: [...(setSubAccountSplitsTx ? [setSubAccountSplitsTx] : []), setSplitsTx],
    };
  }

  public async buildBatchTx(context: State): Promise<ContractTransaction[]> {
    const accountId = (await orcidIdToAccountId(context.claimableId)).toString();

    const { tx: setSplitsTx, receivers } = await this._buildSetSplitsTxAndMetadata(
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

    const splittableAmounts =
      context.claimableAccount?.withdrawableBalances.filter(
        (wb) => BigInt(wb.splittableAmount) > 0n,
      ) || [];
    const collectableAmounts =
      context.claimableAccount?.withdrawableBalances.filter(
        (wb) => BigInt(wb.collectableAmount) > 0n,
      ) || [];

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
