import { Forge, type Source } from '$lib/graphql/generated/graphql';

/**
 * Builds a project profile URL from a project source object.
 * @param source The source to build the URL from.
 * @returns The URL.
 */
export default function (source: Source) {
  switch (source.forge) {
    case Forge.GITHUB:
      return `/app/projects/github/${encodeURIComponent(source.ownerName)}/${encodeURIComponent(
        source.repoName,
      )}`;
  }
}
