import { makeStep } from '$lib/components/stepper/types';
import type { Writable } from 'svelte/store';
import ChooseIdentity from './steps/choose-identity.svelte';

export default () => ({
  context: () => {
    return {} as Writable<unknown>;
  },
  steps: [
    makeStep({
      component: ChooseIdentity,
      props: {},
    }),
  ],
});
