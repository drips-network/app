import { Forge } from '$lib/graphql/__generated__/base-types';

/**
 * Builds a project profile URL from a project source object.
 * @param forge The forge to build the URL for.
 * @param ownerName The github username owning the project.
 * @param repoName The github repo name.
 * @param exact If true, link to the the exact project provided, even if it has been renamed or mis-cased.
 * If false, will auto-redirect to the "real" project URL. Defaults to true.
 * @returns The URL.
 */
export default function (forge: Forge, ownerName: string, repoName: string, exact = true): string {
  switch (forge) {
    case Forge.GitHub:
      return `/app/projects/github/${encodeURIComponent(ownerName)}/${encodeURIComponent(
        repoName,
      )}${exact ? '?exact' : ''}`;
    default:
      throw new Error(`Unsupported forge: ${forge}`);
  }
}
