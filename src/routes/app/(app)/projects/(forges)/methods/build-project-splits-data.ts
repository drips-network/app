import { buildRepresentationalSplits } from '$lib/utils/drips/splits';
import type { GitProject } from '$lib/utils/metadata/types';

export default function buildProjectSplitsData(project: GitProject) {
  return project.claimed
    ? {
        dependencies: buildRepresentationalSplits(project.splits.dependencies),
        maintainers: buildRepresentationalSplits(project.splits.maintainers),
      }
    : undefined;
}
