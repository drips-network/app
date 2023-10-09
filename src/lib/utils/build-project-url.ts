import { Forge } from '$lib/graphql/generated/graphql';
import type { Source } from './metadata/types';

/**
 * Builds a project profile URL from a project source object.
 * @param source The source to build the URL from.
 * @returns The URL.
 */
export default function buildProjectUrlFromSource(source: Source) {
  switch (source.forge) {
    case 'github':
      return `/app/projects/github/${encodeURIComponent(source.ownerName)}/${encodeURIComponent(
        source.repoName,
      )}`;
  }
}

export function buildProjectUrl(forge: Forge, ownerName: string, repoName: string) {
  switch (forge) {
    case Forge.GitHub:
      return `/app/projects/github/${encodeURIComponent(ownerName)}/${encodeURIComponent(
        repoName,
      )}`;
  }
}
