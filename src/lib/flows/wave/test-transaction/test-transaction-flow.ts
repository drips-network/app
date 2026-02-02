import { makeStep } from '$lib/components/stepper/types';
import type { GrantDto } from '$lib/utils/wave/types/grant';
import EnterAddress from './enter-address.svelte';
import Success from './success.svelte';

export default (grant: GrantDto) => ({
  steps: [
    makeStep({
      component: EnterAddress,
      props: { grant },
    }),
    makeStep({
      component: Success,
      props: {},
    }),
  ],
});
