import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get, writable } from 'svelte/store';
import EditDripListStep, { EDIT_DRIP_LIST_STEP_DRIP_LIST_TO_ADD_FRAGMENT, EDIT_DRIP_LIST_STEP_PROJECT_TO_ADD_FRAGMENT } from '../shared/steps/edit-drip-list.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import SelectDripList, { SELECT_DRIP_LIST_DRIP_LIST_TO_ADD_FRAGMENT, SELECT_DRIP_LIST_PROJECT_TO_ADD_FRAGMENT, SELECT_DRIP_LIST_STEP_LISTS_FRAGMENT } from './steps/select-drip-list.svelte';
import assert from '$lib/utils/assert';
import unreachable from '$lib/utils/unreachable';
import type { EditDripListStepSelectedDripListFragment } from '../shared/steps/__generated__/gql.generated';
import { gql } from 'graphql-request';
import type { AddDripListMemberFlowDripListToAddFragment, AddDripListMemberFlowListsFragment, AddDripListMemberFlowProjectToAddFragment } from './__generated__/gql.generated';

export const ADD_DRIP_LIST_MEMBER_FLOW_LISTS_FRAGMENT = gql`
  ${SELECT_DRIP_LIST_STEP_LISTS_FRAGMENT}
  fragment AddDripListMemberFlowLists on DripList {
    ...SelectDripListStepLists
  }
`;

export const ADD_DRIP_LIST_MEMBER_FLOW_PROJECT_TO_ADD_FRAGMENT = gql`
  ${SELECT_DRIP_LIST_PROJECT_TO_ADD_FRAGMENT}
  ${EDIT_DRIP_LIST_STEP_PROJECT_TO_ADD_FRAGMENT}
  fragment AddDripListMemberFlowProjectToAdd on Project {
    ...SelectDripListProjectToAdd
    ...EditDripListStepProjectToAdd
  }
`

export const ADD_DRIP_LIST_MEMBER_FLOW_DRIP_LIST_TO_ADD_FRAGMENT = gql`
  ${SELECT_DRIP_LIST_DRIP_LIST_TO_ADD_FRAGMENT}
  ${EDIT_DRIP_LIST_STEP_DRIP_LIST_TO_ADD_FRAGMENT}
  fragment AddDripListMemberFlowDripListToAdd on DripList {
    ...SelectDripListDripListToAdd
    ...EditDripListStepDripListToAdd
  }
`;

export default (
  /** The current user's Drip Lists. */
  dripLists: AddDripListMemberFlowListsFragment[],
  projectToAdd?: AddDripListMemberFlowProjectToAddFragment,
  dripListToAdd?: AddDripListMemberFlowDripListToAddFragment,
) => {
  const selectedDripListState = writable<{
    dripList: EditDripListStepSelectedDripListFragment
  }>(undefined);

  assert(
    projectToAdd || dripListToAdd,
    'Must provide either a project or a drip list to add to the drip list.',
  );

  return {
    context: undefined,
    steps: [
      makeStep({
        component: SelectDripList,
        props: {
          dripLists,
          selectedDripListState,
          projectOrDripListToAdd: projectToAdd ?? dripListToAdd ?? unreachable(),
        },
      }),
      makeStep({
        component: EditDripListStep,
        props: {
          projectToAdd,
          dripListToAdd,
          selectedDripListState,
        },
      }),
      makeStep({
        component: SuccessStep,
        props: {
          safeAppMode: Boolean(get(walletStore).safe),
          message:
            'Your Drip List has been updated. Please refresh your dashboard to see the changes.',
        },
      }),
    ],
  };
};
