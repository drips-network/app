import { makeStep } from '$lib/components/stepper/types';
import ConfigureProjectSupportButton from './steps/configure-project-support-button.svelte';

// type ConfigureProjectSupportButtonProps = {

// };

// export type ShareOption = {
//   name: string;
//   icon: ComponentType;
//   href?: string;
//   onClick?: (this: ShareOption) => undefined;
// };

// export default (props: ConfigureProjectSupportButtonProps) => ({
export default () => ({
  context: undefined,
  steps: [
    makeStep({
      component: ConfigureProjectSupportButton,
      props: undefined,
    }),
  ],
});
