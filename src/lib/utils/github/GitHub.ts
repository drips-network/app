import network from '$lib/stores/wallet/network';
import walletStore from '$lib/stores/wallet/wallet.store';
import type { Octokit } from '@octokit/rest';
import { Buffer } from 'buffer';
import { get } from 'svelte/store';

export default class GitHub {
  private octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  public async getRepoByOwnerAndName(owner: string, repo: string) {
    const { data } = await this.octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo,
    });

    return data;
  }

  public async getRepoByUrl(repoUrl: string) {
    const url = new URL(repoUrl);

    if (url.host !== 'github.com') {
      throw new Error(`Invalid host: ${url.host}`);
    }

    const [, owner, repo] = url.pathname.split('/');

    return this.getRepoByOwnerAndName(owner, repo);
  }

  public async verifyFundingJson(owner: string, repo: string): Promise<void> {
    const { data } = await this.octokit.repos
      .getContent({
        owner,
        repo,
        path: 'FUNDING.json',
        request: {
          cache: 'reload',
        },
      })
      .catch(() => {
        throw new Error('FUNDING.json not found.');
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileContent = Buffer.from((data as any).content, 'base64').toString('utf-8');

    const fundingJson = JSON.parse(fileContent);

    const fundingJsonOwner =
      fundingJson.drips?.[network.name === 'homestead' ? 'ethereum' : network.name].ownedBy;

    const { address: expectedOwner } = get(walletStore);

    if (fundingJsonOwner.toLowerCase() !== expectedOwner?.toLowerCase()) {
      throw new Error('Invalid FUNDING.json file. Does it have the correct Ethereum address?');
    }
  }
}
