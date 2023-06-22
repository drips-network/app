import type { GitHubSource, GitLabSource, GitProject } from '$lib/utils/metadata/types';

/**
 * Validate that a GitProject is from a specific forge.
 * @param forge The forge to validate for.
 * @param project The project the source of which should be validated.
 * @returns True if it's the expected source, false otherwise.
 */
export default function isForge<FT extends 'gitlab' | 'github'>(
  forge: FT,
  project: GitProject,
): project is GitProject<FT extends 'gitlab' ? GitLabSource : GitHubSource> {
  if (project.source.forge !== forge) return false;

  return true;
}
