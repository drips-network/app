import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import type { Stream } from '$lib/stores/streams/types';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import Pause from './pause.svelte';

export default (stream: Stream) => [
  makeStep({
    component: Pause,
    props: {
      stream,
    },
  }),
  makeStep({
    component: SuccessStep,
    props: {
      safeAppMode: Boolean(get(walletStore).safe),
      message:
        'Your stream has been paused. Please note that it may take some time for your dashboard to update.',
    },
  }),
];
