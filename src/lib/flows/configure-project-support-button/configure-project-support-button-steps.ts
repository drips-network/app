import { makeStep } from '$lib/components/stepper/types';
import type { ComponentProps } from 'svelte';
import ConfigureProjectSupportButton from './steps/configure-project-support-button.svelte';

export default (props: ComponentProps<typeof ConfigureProjectSupportButton>) => ({
  context: undefined,
  steps: [
    makeStep({
      component: ConfigureProjectSupportButton,
      props,
    }),
  ],
});
