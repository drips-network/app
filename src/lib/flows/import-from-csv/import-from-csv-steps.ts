import { makeStep } from '$lib/components/stepper/types';
// import SuccessStep from '$lib/components/success-step/success-step.svelte';
import Upload from './upload.svelte';

export default () => ({
  context: undefined,
  steps: [
    makeStep({
      component: Upload,
      // props: {
      // tokenAddress,
      // },
    }),
    // makeStep({
    //   component: SuccessStep,
    //   props: {
    //     message:
    //       'Your new custom token has been successfully added. You can remove it at any time by navigating to Settings → Custom Tokens.',
    //   },
    // }),
  ],
});
