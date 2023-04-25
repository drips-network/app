// TODO: Temporary types until centralized types for projects are added.

interface GitHubSource {
  type: 'github';
  repoName: string;
  ownerName: string;
  url: string;
}

interface GitLabSource {
  type: 'gitlab';
  repoName: string;
  ownerName: string;
  host: string;
  url: string;
}

interface RadicleSource {
  type: 'radicle';
  rid: string;
  repoName: string;
  seed: string;
  url: string;
}

interface GenericGitSource {
  type: 'generic';
  repoName: string;
  url: string;
}

type Source = GitHubSource | GitLabSource | RadicleSource | GenericGitSource;

/**
 * Builds a project profile URL from a project source object.
 * @param source The source to build the URL from.
 * @returns The URL.
 */
export default function (source: Source) {
  switch (source.type) {
    case 'github':
      return `/app/projects/github/${source.ownerName}/${source.repoName}`;
    case 'gitlab':
      return `/app/projects/gitlab/${source.ownerName}/${source.repoName}`;
    case 'radicle':
      return `/app/projects/radicle/${source.rid}`;
    case 'generic':
      return `/app/projects/git/${encodeURIComponent(source.url)}`;
  }
}
