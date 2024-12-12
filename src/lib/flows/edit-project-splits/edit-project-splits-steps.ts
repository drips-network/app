import { type Items, type Weights } from '$lib/components/list-editor/types';
import { gql } from 'graphql-request';
import { makeStep } from '$lib/components/stepper/types';
import { get, writable } from 'svelte/store';
import SetNewDependencyMaintainerSplit from './steps/set-new-dependency-maintainer-split.svelte';
import EditMaintainerList from './steps/edit-maintainer-list.svelte';
import EditDependencyList from './steps/edit-dependency-list.svelte';
import Review from './steps/review.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import type {
  EditProjectSplitsFlowAddressReceiverFragment,
  EditProjectSplitsFlowDripListReceiverFragment,
  EditProjectSplitsFlowProjectReceiverFragment,
} from './__generated__/gql.generated';
import {
  mapSplitReceiversToEditorConfig,
  SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_ADDRESS_RECEIVER_FRAGMENT,
  SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_DRIP_LIST_RECEIVER_FRAGMENT,
  SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_PROJECT_RECEIVER_FRAGMENT,
} from '$lib/components/list-editor/utils/split-receivers-to-list-editor-config';
import type { AddItemError } from '$lib/components/list-editor/errors';

export const EDIT_PROJECT_SPLITS_FLOW_ADDRESS_RECEIVER_FRAGMENT = gql`
  ${SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_ADDRESS_RECEIVER_FRAGMENT}
  fragment EditProjectSplitsFlowAddressReceiver on AddressReceiver {
    ...SplitReceiversToListEditorConfigAddressReceiver
  }
`;

export const EDIT_PROJECT_SPLITS_FLOW_PROJECT_RECEIVER_FRAGMENT = gql`
  ${SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_PROJECT_RECEIVER_FRAGMENT}
  fragment EditProjectSplitsFlowProjectReceiver on ProjectReceiver {
    weight
    project {
      ...ListEditorProject
      account {
        accountId
      }
    }
    ...SplitReceiversToListEditorConfigProjectReceiver
  }
`;

export const EDIT_PROJECT_SPLITS_FLOW_DRIP_LIST_RECEIVER_FRAGMENT = gql`
  ${SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_DRIP_LIST_RECEIVER_FRAGMENT}
  fragment EditProjectSplitsFlowDripListReceiver on DripListReceiver {
    ...SplitReceiversToListEditorConfigDripListReceiver
  }
`;

type SplitReceiver =
  | EditProjectSplitsFlowAddressReceiverFragment
  | EditProjectSplitsFlowDripListReceiverFragment
  | EditProjectSplitsFlowProjectReceiverFragment;

type Splits = {
  maintainers: EditProjectSplitsFlowAddressReceiverFragment[];
  dependencies: SplitReceiver[];
};

interface ListEditorConfig {
  items: Items;
  weights: Weights;
}

export interface State {
  projectAccountId: string;
  highLevelPercentages: { [key: string]: number };
  maintainerSplits: ListEditorConfig;
  dependencySplits: ListEditorConfig;
  recipientErrors: Array<AddItemError>;
}

const state = (projectAccountId: string, representationalSplits: Splits) => {
  const maintainerSplits = mapSplitReceiversToEditorConfig(representationalSplits.maintainers);
  const dependencySplits = mapSplitReceiversToEditorConfig(representationalSplits.dependencies);

  const maintainersWeight = Object.values(maintainerSplits.weights).reduce((a, b) => a + b, 0);

  const highLevelPercentages = {
    maintainers: maintainersWeight / 10000,
    dependencies: (1000000 - maintainersWeight) / 10000,
  };

  // Scale the percentages within maintainer and dependency splits to add up to 100%

  const rebasedMaintainerWeights = Object.fromEntries(
    Object.entries(maintainerSplits.weights).map(([k, v]) => [
      k,
      Math.round((v / maintainersWeight) * 1000000),
    ]),
  );

  const rebasedDependencyWeights = Object.fromEntries(
    Object.entries(dependencySplits.weights).map(([k, v]) => [
      k,
      Math.round((v / (1000000 - maintainersWeight)) * 1000000),
    ]),
  );

  maintainerSplits.weights = rebasedMaintainerWeights;
  dependencySplits.weights = rebasedDependencyWeights;

  return writable<State>({
    projectAccountId,
    highLevelPercentages,
    maintainerSplits,
    dependencySplits,
    recipientErrors: [],
  });
};

export default (projectAccountId: string, projectSourceUrl: string, splits: Splits) => ({
  context: () => state(projectAccountId, splits),
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
        message: "Your project's splits have been updated sucessfully.",
      },
    }),
  ],
});
