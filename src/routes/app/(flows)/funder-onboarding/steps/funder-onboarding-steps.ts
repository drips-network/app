import { makeStep } from '$lib/components/stepper/types';

import BuildListStep from './build-list/build-list.svelte';
import ConfigureSupportStep from './configure-support/configure-support.svelte';
import ReviewStep from './review/review.svelte';

export default () => [
  makeStep({
    component: BuildListStep,
    props: undefined,
  }),
  makeStep({
    component: ConfigureSupportStep,
    props: undefined,
  }),
  makeStep({
    component: ReviewStep,
    props: undefined,
  }),
];
