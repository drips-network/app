import type { Source } from './metadata/types';

/**
 * Builds a project profile URL from a project source object.
 * @param source The source to build the URL from.
 * @returns The URL.
 */
export default function (source: Source) {
  switch (source.forge) {
    case 'github':
      return `/app/projects/github/${encodeURIComponent(source.ownerName)}/${encodeURIComponent(
        source.repoName,
      )}`;
    case 'gitlab':
      return `/app/projects/gitlab/${encodeURIComponent(source.ownerName)}/${encodeURIComponent(
        source.repoName,
      )}`;
  }
}
