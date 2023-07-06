import { makeStep } from '$lib/components/stepper/types';
import ChooseAction from './steps/choose-action.svelte';

export default (dripListId: string) => ({
  context: undefined,
  steps: [
    makeStep({
      component: ChooseAction,
      props: { dripListId },
    }),
  ],
});
