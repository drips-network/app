import { makeStep } from '$lib/components/stepper/types';
import type { CreateApplicationDto, WrappedRoundPublic } from '$lib/utils/rpgf/schemas';
import { get, writable } from 'svelte/store';
import Confirm from './steps/confirm.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { invalidateAll } from '$app/navigation';

export default (
  applicationData: CreateApplicationDto,
  applicationFormat: WrappedRoundPublic['round']['applicationFormat'],
  roundSlug: string,
) => {
  const context = writable<{ applicationId: string | null }>({
    applicationId: null,
  });

  return {
    context: () => context,
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
        component: SuccessStep,
        props: {
          message:
            'Youʼve successfully submitted your application. The round organizers are reviewing it now. Visit the round\'s page and click "All applications" to check on your applications at any time.',
          action: 'link',
          linkText: 'View your application',
          href: () => `/app/rpgf/rounds/${roundSlug}/applications/${get(context).applicationId}`,
          onAction() {
            invalidateAll();

            // Delete the in-progress application from localstorage
            localStorage.removeItem(`rpgf-form-data-${roundSlug}`);
          },
        },
      }),
    ],
  };
};
