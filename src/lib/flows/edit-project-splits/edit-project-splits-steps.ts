import type { Items, ListItem, Percentages } from '$lib/components/list-editor/list-editor.svelte';
import { makeStep } from '$lib/components/stepper/types';
import type { ClaimedGitProject } from '$lib/utils/metadata/types';
import { get, writable } from 'svelte/store';
import NewSplits from './steps/set-new-dependency-maintainer-split.svelte';
import type { SplitsEntry } from 'radicle-drips';
import FetchSplitsConfig from './steps/fetch-splits-config.svelte';
import type { AddressSplit, ProjectSplit } from '$lib/components/splits/splits.svelte';
import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
import EditMaintainerList from './steps/edit-maintainer-list.svelte';
import EditDependencyList from './steps/edit-dependency-list.svelte';
import Review from './steps/review.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';

type RepresentationalSplit = AddressSplit | ProjectSplit;

interface SplitsConfig {
  selected: string[];
  items: Items;
  percentages: Percentages;
}

export interface State {
  project: ClaimedGitProject;
  onChainSplitsConfig: SplitsEntry[] | undefined;
  highLevelPercentages: { [key: string]: number };
  maintainerSplits: SplitsConfig;
  dependencySplits: SplitsConfig;
}

const MAX_SPLITS_WEIGHT = 1000000;

function getSplitPercent(weight: number) {
  return ((weight * MAX_SPLITS_WEIGHT) / MAX_SPLITS_WEIGHT / MAX_SPLITS_WEIGHT) * 100;
}

function mapRepresentationalSplitToEditorItem(input: RepresentationalSplit): ListItem {
  if ('address' in input) {
    return {
      type: 'selectable',
      label: {
        component: IdentityBadge,
        props: {
          address: input.address,
          size: 'medium',
        },
      },
      editablePercentage: true,
    };
  } else {
    return {
      type: 'selectable',
      label: {
        component: ProjectBadge,
        props: {
          project: input.project,
        },
      },
      editablePercentage: true,
    };
  }
}

function mapRepresentationalSplits(input: RepresentationalSplit[]) {
  return {
    selected: input.map((v) => ('address' in v ? v.address : v.project.source.url)),
    items: Object.fromEntries(
      input.map((v) => [
        'address' in v ? v.address : v.project.source.url,
        mapRepresentationalSplitToEditorItem(v),
      ]),
    ),
    percentages: Object.fromEntries(
      input.map((v) => [
        'address' in v ? v.address : v.project.source.url,
        getSplitPercent(v.weight),
      ]),
    ),
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
    onChainSplitsConfig: undefined,
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
      component: FetchSplitsConfig,
      props: undefined,
    }),
    makeStep({
      component: NewSplits,
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
