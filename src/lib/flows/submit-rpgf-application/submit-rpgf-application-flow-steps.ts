import { makeStep } from '$lib/components/stepper/types';
import type { CreateApplicationDto, WrappedRoundPublic } from '$lib/utils/rpgf/schemas';
import { writable } from 'svelte/store';
import Confirm from './steps/confirm.svelte';
import Success from './steps/success.svelte';

export default (
  applicationData: CreateApplicationDto,
  applicationFormat: WrappedRoundPublic['round']['applicationFormat'],
  roundSlug: string,
) => ({
  context: () =>
    writable<{ applicationId: string | null }>({
      applicationId: null,
    }),
  steps: [
    makeStep({
      component: Confirm,
      props: {
        applicationData,
        applicationFormat,
        roundSlug,
      },
    }),
    makeStep({
      component: Success,
      props: {
        roundSlug,
      },
    }),
  ],
});
