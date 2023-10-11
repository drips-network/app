import type { AddressSplit, ProjectSplit } from '$lib/components/splits/splits.svelte';
import { ProjectVerificationStatus } from '$lib/graphql/generated/graphql';
import type { ClaimedGitProject, GitProject } from '$lib/utils/project/types';
import { AddressDriverClient } from 'radicle-drips';

export async function buildProjectSplitsData(project: GitProject) {
  if (project.verificationStatus !== ProjectVerificationStatus.Claimed) {
    return null;
  }

  const maintainers: AddressSplit[] =
    project.splits.maintainers?.map((m) => ({
      type: 'address-split',
      address: AddressDriverClient.getUserAddress(m.fundeeAccountId),
      weight: m.weight,
    })) || [];

  const projectDependenciesOfTypeAddress: AddressSplit[] =
    project.splits.dependencies?.ofTypeAddress?.map((m) => ({
      type: 'address-split',
      address: AddressDriverClient.getUserAddress(m.fundeeAccountId),
      weight: m.weight,
    })) || [];

  const projectDependenciesOfTypeProject: ProjectSplit[] =
    project.splits.dependencies?.ofTypeProject?.map((d) => ({
      type: 'project-split',
      project: d.fundeeProject as ClaimedGitProject,
      weight: d.weight,
    })) || [];

  return {
    maintainers,
    dependencies: [...projectDependenciesOfTypeAddress, ...projectDependenciesOfTypeProject],
  };
}
