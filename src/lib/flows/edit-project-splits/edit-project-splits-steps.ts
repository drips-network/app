import type { ListEditorConfig, ListItem } from '$lib/components/list-editor/list-editor.svelte';
import { makeStep } from '$lib/components/stepper/types';
import type { ClaimedGitProject } from '$lib/utils/metadata/types';
import { get, writable } from 'svelte/store';
import SetNewDependencyMaintainerSplit from './steps/set-new-dependency-maintainer-split.svelte';
import type {
  AddressSplit,
  DripListSplit,
  ProjectSplit,
} from '$lib/components/splits/splits.svelte';
import EditMaintainerList from './steps/edit-maintainer-list.svelte';
import EditDependencyList from './steps/edit-dependency-list.svelte';
import Review from './steps/review.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import ethAddressItem from '$lib/components/list-editor/item-templates/eth-address';
import dripListItem from '$lib/components/list-editor/item-templates/drip-list';
import projectItem from '$lib/components/list-editor/item-templates/project';

type RepresentationalSplit = AddressSplit | ProjectSplit | DripListSplit;

export interface State {
  project: ClaimedGitProject;
  highLevelPercentages: { [key: string]: number };
  maintainerSplits: ListEditorConfig;
  dependencySplits: ListEditorConfig;
}

const MAX_SPLITS_WEIGHT = 1000000;

function getSplitPercent(weight: number) {
  return ((weight * MAX_SPLITS_WEIGHT) / MAX_SPLITS_WEIGHT / MAX_SPLITS_WEIGHT) * 100;
}

function mapRepresentationalSplitToEditorItem(input: RepresentationalSplit): ListItem {
  switch (input.type) {
    case 'address-split':
      return ethAddressItem(input.address);
    case 'drip-list-split':
      return dripListItem(input.listName, input.listId, input.listOwner);
    case 'project-split':
      return projectItem(input.project);
  }
}

function mapRepresentationalSplits(input: RepresentationalSplit[]) {
  const mapSplitSlug = (split: RepresentationalSplit) => {
    switch (split.type) {
      case 'address-split':
        return split.address;
      case 'drip-list-split':
        return split.listId;
      case 'project-split':
        return split.project.source.url;
    }
  };

  return {
    selected: input.map(mapSplitSlug),
    items: Object.fromEntries(
      input.map((v) => [mapSplitSlug(v), mapRepresentationalSplitToEditorItem(v)]),
    ),
    percentages: Object.fromEntries(input.map((v) => [mapSplitSlug(v), getSplitPercent(v.weight)])),
  };
}

const state = (
  project: ClaimedGitProject,
  representationalSplits: {
    maintainers: RepresentationalSplit[];
    dependencies: RepresentationalSplit[];
  },
) => {
  const maintainerSplits = mapRepresentationalSplits(representationalSplits.maintainers);
  const dependencySplits = mapRepresentationalSplits(representationalSplits.dependencies);

  const maintainerPercentage = Object.values(maintainerSplits.percentages).reduce(
    (a, b) => a + b,
    0,
  );

  const highLevelPercentages = {
    maintainers: Math.round((maintainerPercentage / 100) * 100),
    dependencies: Math.round(((100 - maintainerPercentage) / 100) * 100),
  };

  // Rebase the percentages within maintainer and dependency splits to add up to 100%

  const rebasedMaintainerPercentages = Object.fromEntries(
    Object.entries(maintainerSplits.percentages).map(([k, v]) => [
      k,
      Math.round((v / maintainerPercentage) * 100),
    ]),
  );

  const rebasedDependencyPercentages = Object.fromEntries(
    Object.entries(dependencySplits.percentages).map(([k, v]) => [
      k,
      Math.round((v / (100 - maintainerPercentage)) * 100),
    ]),
  );

  maintainerSplits.percentages = rebasedMaintainerPercentages;
  dependencySplits.percentages = rebasedDependencyPercentages;

  return writable<State>({
    project,
    highLevelPercentages,
    maintainerSplits,
    dependencySplits,
  });
};

export default (
  project: ClaimedGitProject,
  representationalSplits: {
    maintainers: RepresentationalSplit[];
    dependencies: RepresentationalSplit[];
  },
) => ({
  context: () => state(project, representationalSplits),
  steps: [
    makeStep({
      component: SetNewDependencyMaintainerSplit,
      props: undefined,
    }),
    makeStep({
      component: EditMaintainerList,
      props: undefined,
    }),
    makeStep({
      component: EditDependencyList,
      props: undefined,
    }),
    makeStep({
      component: Review,
      props: undefined,
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your Project Splits have been updated sucessfully. Please refresh your dashboard to see the changes.',
      },
    }),
  ],
});
