import type { Source } from './metadata/types';

/**
 * Builds a project profile URL from a project source object.
 * @param source The source to build the URL from.
 * @returns The URL.
 */
export default function (source: Source) {
  switch (source.forge) {
    case 'github':
      return `/app/projects/github/${source.ownerName}/${source.repoName}`;
    case 'gitlab':
      return `/app/projects/gitlab/${source.ownerName}/${source.repoName}`;
  }
}
