import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import ConfigureStream from './steps/configure-stream.svelte';

export default (dripListId: string) => ({
  context: undefined,
  steps: [
    makeStep({
      component: ConfigureStream,
      props: { dripListId },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        message:
          'Your support stream has successfully been created. Please refresh the app to see your changes.',
      },
    }),
  ],
});
