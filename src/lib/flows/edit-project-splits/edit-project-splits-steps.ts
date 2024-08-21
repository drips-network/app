import {
  LIST_EDITOR_DRIP_LIST_FRAGMENT,
  LIST_EDITOR_PROJECT_FRAGMENT,
  type Items,
  type ListEditorItem,
  type Weights,
} from '$lib/components/list-editor/types';
import { makeStep } from '$lib/components/stepper/types';
import { get, writable } from 'svelte/store';
import SetNewDependencyMaintainerSplit from './steps/set-new-dependency-maintainer-split.svelte';
import EditMaintainerList from './steps/edit-maintainer-list.svelte';
import EditDependencyList from './steps/edit-dependency-list.svelte';
import Review from './steps/review.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import { gql } from 'graphql-request';
import type {
  EditProjectSplitsFlowAddressReceiverFragment,
  EditProjectSplitsFlowDripListReceiverFragment,
  EditProjectSplitsFlowProjectReceiverFragment,
} from './__generated__/gql.generated';

export const EDIT_PROJECT_SPLITS_FLOW_ADDRESS_RECEIVER_FRAGMENT = gql`
  fragment EditProjectSplitsFlowAddressReceiver on AddressReceiver {
    weight
    account {
      accountId
      address
    }
  }
`;

export const EDIT_PROJECT_SPLITS_FLOW_PROJECT_RECEIVER_FRAGMENT = gql`
  ${LIST_EDITOR_PROJECT_FRAGMENT}
  fragment EditProjectSplitsFlowProjectReceiver on ProjectReceiver {
    weight
    project {
      ...ListEditorProject
      account {
        accountId
      }
    }
  }
`;

export const EDIT_PROJECT_SPLITS_FLOW_DRIP_LIST_RECEIVER_FRAGMENT = gql`
  ${LIST_EDITOR_DRIP_LIST_FRAGMENT}
  fragment EditProjectSplitsFlowDripListReceiver on DripListReceiver {
    weight
    dripList {
      ...ListEditorDripList
      account {
        accountId
      }
    }
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
}

function mapSplitReceiverToEditorItem(input: SplitReceiver): ListEditorItem {
  switch (input.__typename) {
    case 'AddressReceiver':
      return { type: 'address', address: input.account.address };
    case 'DripListReceiver':
      return { type: 'drip-list', dripList: input.dripList };
    case 'ProjectReceiver':
      return { type: 'project', project: input.project };
  }
}

function extractAccountId(input: SplitReceiver) {
  switch (input.__typename) {
    case 'AddressReceiver':
      return input.account.accountId;
    case 'DripListReceiver':
      return input.dripList.account.accountId;
    case 'ProjectReceiver':
      return input.project.account.accountId;
  }
}

function mapSplitReceiversToEditorConfig(input: SplitReceiver[]) {
  return {
    items: Object.fromEntries(
      input.map((v) => [extractAccountId(v), mapSplitReceiverToEditorItem(v)]),
    ),
    weights: Object.fromEntries(input.map((v) => [extractAccountId(v), v.weight])),
  };
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
