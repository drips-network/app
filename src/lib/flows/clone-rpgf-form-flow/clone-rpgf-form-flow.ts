import { makeStep } from '$lib/components/stepper/types';
import type { ApplicationForm } from '$lib/utils/rpgf/types/application';
import EnterName from './enter-name.svelte';

export default (form: ApplicationForm, roundId: string) => {
  return {
    steps: [
      makeStep({
        component: EnterName,
        props: {
          form,
          roundId,
        },
      }),
    ],
  };
};
