import { Forge } from "$lib/graphql/__generated__/base-types";

/**
 * Builds a project profile URL from a project source object.
 * @param source The source to build the URL from.
 * @returns The URL.
 */
export default function (forge: Forge, ownerName: string, repoName: string): string {
  switch (forge) {
    case Forge.GitHub:
      return `/app/projects/github/${encodeURIComponent(ownerName)}/${encodeURIComponent(
        repoName,
      )}`;
    default:
      throw new Error(`Unsupported forge: ${forge}`);
  }
}
