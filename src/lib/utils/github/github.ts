import octokit from './octokit';

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

export default {
  getRepoByOwnerAndName,
  getRepoByUrl,
};
