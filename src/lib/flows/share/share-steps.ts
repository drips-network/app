import { makeStep } from '$lib/components/stepper/types';
import type configureProjectSupportButtonSteps from '../configure-project-support-button/configure-project-support-button-steps';
import ShareUrl from './steps/share-url.svelte';
import { type ComponentType } from 'svelte';

type ShareUrlProps = {
  url: string;
  downloadableImageUrl?: string;
  text?: string;
  shareModalText?: string | undefined;
  supportButtonOptions?: Parameters<typeof configureProjectSupportButtonSteps>[0];
};

export type ShareOption = {
  name: string;
  icon: ComponentType;
  href?: string;
  onClick?: (this: ShareOption) => undefined;
};

export default (props: ShareUrlProps) => ({
  context: undefined,
  steps: [
    makeStep({
      component: ShareUrl,
      props,
    }),
  ],
});
