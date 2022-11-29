import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import type { Stream } from '$lib/stores/streams/types';
import Unpause from './unpause.svelte';

export default (stream: Stream) => [
  makeStep({
    component: Unpause,
    props: {
      stream,
    },
  }),
  makeStep({
    component: SuccessStep,
    props: {
      message:
        'Your stream has been unpaused. Please note that it may take some time for your dashboard to update.',
    },
  }),
];
