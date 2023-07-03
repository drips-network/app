export async function getRepoByOwnerAndName(owner: string, repo: string) {
  const response = await fetch(
    `https://gitlab.com/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  return data;
}

export async function getRepoByUrl(repoUrl: string) {
  const url = new URL(repoUrl);

  if (url.host !== 'gitlab.com') {
    throw new Error(`Invalid host: ${url.host}`);
  }

  const [, owner, repo] = url.pathname.split('/');

  return getRepoByOwnerAndName(owner, repo);
}

export default {
  getRepoByOwnerAndName,
  getRepoByUrl,
};
