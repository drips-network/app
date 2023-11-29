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

  public async getFundingJson(owner: string, repo: string, template: string): Promise<any> {
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

    if (JSON.stringify(fundingJson).replace(/\s/g, '') !== template.replace(/\s/g, '')) {
      throw new Error('Invalid FUNDING.json file. Does it have the correct Ethereum address?');
    }

    return fundingJson;
  }
}
