import {
  DRIP_LIST_MEMBERS_EDITOR_DRIP_LIST_FRAGMENT,
  DRIP_LIST_MEMBERS_EDITOR_PROJECT_FRAGMENT,
  type ListEditorConfig,
  type ListItem,
} from '$lib/components/list-editor/list-editor.svelte';
import { makeStep } from '$lib/components/stepper/types';
import { get, writable } from 'svelte/store';
import SetNewDependencyMaintainerSplit from './steps/set-new-dependency-maintainer-split.svelte';
import EditMaintainerList from './steps/edit-maintainer-list.svelte';
import EditDependencyList from './steps/edit-dependency-list.svelte';
import Review from './steps/review.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import ethAddressItem from '$lib/components/list-editor/item-templates/eth-address';
import dripListItem from '$lib/components/list-editor/item-templates/drip-list';
import projectItem from '$lib/components/list-editor/item-templates/project';
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
      address
    }
  }
`;

export const EDIT_PROJECT_SPLITS_FLOW_PROJECT_RECEIVER_FRAGMENT = gql`
  ${DRIP_LIST_MEMBERS_EDITOR_PROJECT_FRAGMENT}
  fragment EditProjectSplitsFlowProjectReceiver on ProjectReceiver {
    weight
    project {
      ...DripListMembersEditorProject
    }
  }
`;

export const EDIT_PROJECT_SPLITS_FLOW_DRIP_LIST_RECEIVER_FRAGMENT = gql`
  ${DRIP_LIST_MEMBERS_EDITOR_DRIP_LIST_FRAGMENT}
  fragment EditProjectSplitsFlowDripListReceiver on DripListReceiver {
    weight
    dripList {
      ...DripListMembersEditorDripList
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

export interface State {
  projectAccountId: string;
  highLevelPercentages: { [key: string]: number };
  maintainerSplits: ListEditorConfig;
  dependencySplits: ListEditorConfig;
}

const MAX_SPLITS_WEIGHT = 1000000;

function getSplitPercent(weight: number) {
  return ((weight * MAX_SPLITS_WEIGHT) / MAX_SPLITS_WEIGHT / MAX_SPLITS_WEIGHT) * 100;
}

function mapSplitReceiverToEditorItem(input: SplitReceiver): ListItem {
  switch (input.__typename) {
    case 'AddressReceiver':
      return ethAddressItem(input.account.address);
    case 'DripListReceiver':
      return dripListItem(input.dripList);
    case 'ProjectReceiver':
      return projectItem(input.project);
  }
}

function mapSplitReceiversToEditorConfig(input: SplitReceiver[]) {
  const mapSplitSlug = (split: SplitReceiver) => {
    switch (split.__typename) {
      case 'AddressReceiver':
        return split.account.address;
      case 'DripListReceiver':
        return split.dripList.account.accountId;
      case 'ProjectReceiver':
        return split.project.source.url;
    }
  };

  return {
    selected: input.map(mapSplitSlug),
    items: Object.fromEntries(input.map((v) => [mapSplitSlug(v), mapSplitReceiverToEditorItem(v)])),
    percentages: Object.fromEntries(input.map((v) => [mapSplitSlug(v), getSplitPercent(v.weight)])),
  };
}

const state = (projectAccountId: string, representationalSplits: Splits) => {
  const maintainerSplits = mapSplitReceiversToEditorConfig(representationalSplits.maintainers);
  const dependencySplits = mapSplitReceiversToEditorConfig(representationalSplits.dependencies);

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
      props: {
        projectSourceUrl,
      },
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
