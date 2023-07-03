import { buildRepresentationalSplits } from '$lib/utils/drips/splits';
import { getSubgraphClient } from '$lib/utils/get-drips-clients';
import type { GitProject, RepoDriverAccountSplits } from '$lib/utils/metadata/types';

export async function buildProjectSplitsData(project: GitProject) {
  const validMetadataSplits = await getValidMetadataSplits(project);
  if (!validMetadataSplits) return null;

  const representationalSplits = await Promise.all([
    buildRepresentationalSplits(validMetadataSplits.dependencies),
    buildRepresentationalSplits(validMetadataSplits.maintainers),
  ]);

  return {
    dependencies: representationalSplits[0],
    maintainers: representationalSplits[1],
  };
}

async function getValidMetadataSplits(
  project: GitProject,
): Promise<RepoDriverAccountSplits | null> {
  if (!project.claimed) return null;

  const subgraphClient = getSubgraphClient();

  const onChainSplitsConfig = await subgraphClient.getSplitsConfigByUserId(
    project.repoDriverAccount.userId,
  );

  const result: RepoDriverAccountSplits = { maintainers: [], dependencies: [] };
  const usedOnChainSplitEntryIds: string[] = [];

  for (const maintainerMetadataSplit of project.splits.maintainers) {
    const matchingOnChainSplit = onChainSplitsConfig.find(
      (v) =>
        v.userId === maintainerMetadataSplit.account.userId &&
        !usedOnChainSplitEntryIds.includes(v.id),
    );

    if (!matchingOnChainSplit) continue;

    result.maintainers.push({
      ...maintainerMetadataSplit,
      weight: Number(matchingOnChainSplit.weight),
    });

    usedOnChainSplitEntryIds.push(matchingOnChainSplit.id);
  }

  for (const dependencyMetadataSplit of project.splits.dependencies) {
    const matchingOnChainSplit = onChainSplitsConfig.find(
      (v) =>
        v.userId === dependencyMetadataSplit.account.userId &&
        !usedOnChainSplitEntryIds.includes(v.id),
    );

    if (!matchingOnChainSplit) continue;

    result.dependencies.push({
      ...dependencyMetadataSplit,
      weight: Number(matchingOnChainSplit.weight),
    });

    usedOnChainSplitEntryIds.push(matchingOnChainSplit.id);
  }

  return result;
}
