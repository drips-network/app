import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import editStreamFlowState from './edit-stream-flow-state';
import EnterNewDetails from './enter-new-details.svelte';
import type { EditStreamFlowStreamFragment } from './__generated__/gql.generated';

export default (stream: EditStreamFlowStreamFragment) => ({
  context: () => editStreamFlowState(stream),
  steps: [
    makeStep({
      component: EnterNewDetails,
      props: {
        stream,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your stream has successfully been edited. It may take some time for your dashboard to update.',
      },
    }),
  ],
});
