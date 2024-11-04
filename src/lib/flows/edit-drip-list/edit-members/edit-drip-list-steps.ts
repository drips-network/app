import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get, writable } from 'svelte/store';
import EditDripListStep from '../shared/steps/edit-drip-list.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import {
  mapSplitReceiversToEditorConfig,
  SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_ADDRESS_RECEIVER_FRAGMENT,
  SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_DRIP_LIST_RECEIVER_FRAGMENT,
  SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_PROJECT_RECEIVER_FRAGMENT,
} from '$lib/components/list-editor/utils/split-receivers-to-list-editor-config';
import { gql } from 'graphql-request';
import type { EditDripListFlowDripListFragment } from './__generated__/gql.generated';

export const EDIT_DRIP_LIST_FLOW_DRIP_LIST_FRAGMENT = gql`
  ${SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_ADDRESS_RECEIVER_FRAGMENT}
  ${SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_DRIP_LIST_RECEIVER_FRAGMENT}
  ${SPLIT_RECEIVERS_TO_LIST_EDITOR_CONFIG_PROJECT_RECEIVER_FRAGMENT}
  fragment EditDripListFlowDripList on DripList {
    name
    description
    isVisible
    account {
      accountId
    }
    splits {
      ... on DripListReceiver {
        ...SplitReceiversToListEditorConfigDripListReceiver
      }
      ... on AddressReceiver {
        ...SplitReceiversToListEditorConfigAddressReceiver
      }
      ... on ProjectReceiver {
        ...SplitReceiversToListEditorConfigProjectReceiver
      }
    }
  }
`;

export default (dripList: EditDripListFlowDripListFragment) => {
  const state = writable({
    listEditorConfig: mapSplitReceiversToEditorConfig(dripList.splits),
    name: dripList.name,
    description: dripList.description || undefined,
    dripListAccountId: dripList.account.accountId,
    isHidden: !dripList.isVisible,
  });

  return {
    context: undefined,
    steps: [
      makeStep({
        component: EditDripListStep,
        props: {
          state,
        },
      }),
      makeStep({
        component: SuccessStep,
        props: {
          safeAppMode: Boolean(get(walletStore).safe),
          message: 'Your Drip List has been updated. Please refresh the page to see the changes.',
        },
      }),
    ],
  };
};
