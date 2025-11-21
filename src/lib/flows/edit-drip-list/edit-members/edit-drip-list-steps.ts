import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get, writable } from 'svelte/store';
import EditDripListStep from '../shared/steps/edit-drip-list.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import {
  mapSplitReceiversToEditorConfig,
  type SplitReceiver,
} from '$lib/components/list-editor/utils/split-receivers-to-list-editor-config';
import type { EditDripListFlowDripListFragment } from '../__generated__/gql.generated';

export default (dripList: EditDripListFlowDripListFragment) => {
  const context = writable({
    listEditorConfig: mapSplitReceiversToEditorConfig(dripList.splits as SplitReceiver[]),
    name: dripList.name,
    description: dripList.description || undefined,
    dripListAccountId: dripList.account.accountId,
    isVisible: dripList.isVisible,
  });

  return {
    context: () => context,
    steps: [
      makeStep({
        component: EditDripListStep,
        props: {},
      }),
      makeStep({
        component: SuccessStep,
        props: {
          safeAppMode: Boolean(get(walletStore).safe),
          message: 'Your Drip List has been updated.',
        },
      }),
    ],
  };
};
