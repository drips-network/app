import octokit from './octokit';
import { Buffer } from 'buffer';

export async function getRepoByOwnerAndName(owner: string, repo: string) {
  const { data } = await octokit.request('GET /repos/{owner}/{repo}', {
    owner,
    repo,
  });

  return data;
}

export async function getRepoByUrl(repoUrl: string) {
  const url = new URL(repoUrl);

  if (url.host !== 'github.com') {
    throw new Error(`Invalid host: ${url.host}`);
  }

  const [, owner, repo] = url.pathname.split('/');

  return getRepoByOwnerAndName(owner, repo);
}

async function getFundingJson(owner: string, repo: string, template: string): Promise<any> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'FUNDING.json',
    });

    const fileContent = Buffer.from((data as any).content, 'base64').toString('utf-8');

    const fundingJson = JSON.parse(fileContent);
    console.log('💧 ~ file: github.ts:36 ~ getFundingJson ~ fundingJson:', fundingJson);

    if (JSON.stringify(fundingJson).replace(/\s/g, '') !== template.replace(/\s/g, '')) {
      throw new Error(`Invalid FUNDING.json: ${fileContent}`);
    }

    return fundingJson;
  } catch (error) {
    throw new Error('FUNDING.json not found.');
  }
}

export default {
  getRepoByOwnerAndName,
  getRepoByUrl,
  getFundingJson,
};
