import { getRepoDriverClient } from './get-drips-clients';

import { Forge } from 'radicle-drips';
import type { Address, UserId } from './metadata/types';
import { ethers } from 'ethers';

export type RepoId = string;

type OnChainInfo =
  | {
      userId: UserId;
      repoId: RepoId;
      ownerAddress: Address;
      isClaimed: true;
    }
  | {
      userId: UserId;
      repoId: RepoId;
      ownerAddress: null;
      isClaimed: false;
    };

export default class RepoDriverUtils {
  public static forgeFromString(forgeAsString: string) {
    let forge: Forge;
    if (forgeAsString === 'github') {
      forge = Forge.GitHub;
    } else if (forgeAsString === 'gitlab') {
      forge = Forge.GitLab;
    } else if (forgeAsString === 'radicle') {
      throw new Error('Radicle forges are not supported yet.');
    } else {
      throw new Error(`Unknown forge type: ${forgeAsString}`);
    }

    return forge;
  }

  public static async getOnChainInfo(repoName: string, forge: string): Promise<OnChainInfo>;
  public static async getOnChainInfo(repoName: string, forge: Forge): Promise<OnChainInfo>;
  public static async getOnChainInfo(
    repoName: string,
    forge: Forge | string,
  ): Promise<OnChainInfo> {
    const repoDriverClient = await getRepoDriverClient();

    if (typeof forge === 'string') {
      forge = RepoDriverUtils.forgeFromString(forge);
    }

    const repoId = await repoDriverClient.getRepoId(forge, repoName);
    const userId = await repoDriverClient.getUserId(repoId);
    const ownerAddress = await repoDriverClient.getRepoOwner(repoId);
    const isClaimed = ownerAddress !== ethers.constants.AddressZero;

    if (isClaimed) {
      return {
        userId,
        repoId,
        ownerAddress: ownerAddress as Address,
        isClaimed: true,
      };
    }

    return {
      userId,
      repoId,
      ownerAddress: null,
      isClaimed: false,
    };
  }
}
