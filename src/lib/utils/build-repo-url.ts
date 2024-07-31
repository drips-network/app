import { BASE_URL } from './base-url';
import { isValidGitUrl } from './is-valid-git-url';

export function isDripsProjectUrl(value: string): boolean {
  return value.includes(`${BASE_URL}/app/projects/`);
}

export function buildRepositoryURL(url: string): string {
  const parsedUrl = new URL(url);
  const pathSegments = parsedUrl.pathname.split('/').filter((segment) => segment.length > 0);

  const forgeIndex = pathSegments.findIndex((segment) =>
    ['github', 'gitlab', 'bitbucket'].includes(segment),
  );

  if (forgeIndex !== -1) {
    const forge = pathSegments[forgeIndex];
    const repoPath = pathSegments.slice(forgeIndex + 1).join('/');

    if (!repoPath) {
      throw new Error('Repository path is incomplete.');
    }

    if (forge === 'github') {
      const githubUrl = `https://github.com/${repoPath}`;

      if (isValidGitUrl(githubUrl)) {
        return `https://github.com/${repoPath}`;
      }

      throw new Error(`Invalid GitHub URL: ${githubUrl}.`);
    } else {
      throw new Error(`Unsupported forge: ${forge}.`);
    }
  }

  throw new Error('Forge not found in the URL path.');
}
