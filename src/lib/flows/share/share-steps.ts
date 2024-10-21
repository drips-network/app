import { makeStep } from '$lib/components/stepper/types';
import ShareUrl from './steps/share-url.svelte';
import { type ComponentType } from 'svelte';

type ShareUrlProps = {
  url: string;
  downloadableImageUrl?: string;
  text?: string;
  shareModalText?: string | undefined;
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
