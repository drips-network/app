import network from '$lib/stores/wallet/network';
import type { Octokit } from '@octokit/rest';
import { Buffer } from 'buffer';

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

  public async getFundingJsonAddress(owner: string, repo: string): Promise<string | null> {
    const { data } = await this.octokit.repos
      .getContent({
        owner,
        repo,
        path: 'FUNDING.json',
        request: {
          cache: 'reload',
        },
        headers: {
          'If-None-Match': '',
        },
      })
      .catch(() => {
        throw new Error('FUNDING.json not found.');
      });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileContent = Buffer.from((data as any).content, 'base64').toString('utf-8');

      const fundingJson = JSON.parse(fileContent);
      return (
        fundingJson.drips?.[network.name === 'homestead' ? 'ethereum' : network.name].ownedBy ??
        null
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      throw new Error(
        `Unable to parse the FUNDING.json file. Ensure it exists, is valid JSON, and includes an address for ${network.label}.`,
      );
    }
  }

  public async verifyFundingJson(
    owner: string,
    repo: string,
    expectedAddress: string,
  ): Promise<void> {
    const fundingJsonOwner = await this.getFundingJsonAddress(owner, repo);

    if (!fundingJsonOwner) {
      throw new Error('Invalid FUNDING.json file. Does it exist?');
    }

    if (fundingJsonOwner.toLowerCase() !== expectedAddress?.toLowerCase()) {
      throw new Error('Invalid FUNDING.json file. Does it have the correct Ethereum address?');
    }
  }
}
