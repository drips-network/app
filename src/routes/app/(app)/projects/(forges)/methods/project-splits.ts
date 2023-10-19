import {
  ReceiverType,
  type Project,
  type AddressReceiver,
  type ProjectReceiver,
  type DripListReceiver,
} from '$lib/graphql/generated/graphql';
import type { RepresentationalSplit } from '$lib/utils/drips/splits';
import isClaimed from '$lib/utils/project/is-claimed';

export function buildProjectSplitsData(project: Project) {
  if (!isClaimed(project)) {
    return null;
  }

  const maintainers: RepresentationalSplit[] = [];
  for (const addressReceiver of project.splits?.maintainers || []) {
    maintainers.push({
      type: 'address-split' as const,
      address: addressReceiver.address,
      weight: addressReceiver.weight,
    });
  }

  const dependencies: RepresentationalSplit[] = [];
  for (const splitsReceiver of project.splits?.dependencies || []) {
    if (splitsReceiver.type === ReceiverType.ADDRESS) {
      dependencies.push({
        type: 'address-split' as const,
        address: (splitsReceiver as AddressReceiver).address,
        weight: splitsReceiver.weight,
      });
    } else if (splitsReceiver.type === ReceiverType.PROJECT) {
      dependencies.push({
        type: 'project-split' as const,
        project: (splitsReceiver as ProjectReceiver).project,
        weight: splitsReceiver.weight,
      });
    } else {
      const dripListReceiver = splitsReceiver as DripListReceiver;
      dependencies.push({
        type: 'drip-list-split' as const,
        listId: dripListReceiver.dripList.id,
        listName: dripListReceiver.dripList.name ?? 'Unnamed Drip List',
        listOwner: dripListReceiver.dripList.owner.address,
        weight: dripListReceiver.weight,
      });
    }
  }

  return {
    dependencies,
    maintainers,
  };
}
