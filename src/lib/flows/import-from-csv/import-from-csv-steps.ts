import { makeStep } from '$lib/components/stepper/types';
import Upload from './upload.svelte';

export default () => ({
  context: undefined,
  steps: [
    makeStep({
      component: Upload,
      props: undefined,
    }),
  ],
});
