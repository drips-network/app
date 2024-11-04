import type { SupportButtonData } from '$lib/components/project-support-button/project-support-button';
import { makeStep } from '$lib/components/stepper/types';
import ConfigureProjectSupportButton from './steps/configure-project-support-button.svelte';

type ConfigureProjectSupportButtonProps = {
  supportButtonData: SupportButtonData;
  projectSourceUrl: string;
};

export default (props: ConfigureProjectSupportButtonProps) => ({
  context: undefined,
  steps: [
    makeStep({
      component: ConfigureProjectSupportButton,
      props,
    }),
  ],
});
