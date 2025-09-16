import { makeStep } from '$lib/components/stepper/types';
import { get, writable } from 'svelte/store';
import Confirm from './steps/confirm.svelte';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { invalidate } from '$app/navigation';
import type {
  Application,
  ApplicationFormFields,
  CreateApplicationDto,
} from '$lib/utils/rpgf/types/application';

export default (
  applicationData: CreateApplicationDto,
  roundName: string,
  categoryName: string,
  formFields: ApplicationFormFields,
  roundSlug: string,
  roundId: string,
  userId: string,
  isUpdateForApplication: Application | null,
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
          formFields,
          applicationData,
          roundSlug,
          roundId,
          roundName,
          categoryName,
          isUpdateForApplication,
          userId,
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
            invalidate('rpgf:round');

            // Delete the in-progress application from localstorage
            localStorage.removeItem(`rpgf-form-data-${roundSlug}`);
          },
        },
      }),
    ],
  };
};
