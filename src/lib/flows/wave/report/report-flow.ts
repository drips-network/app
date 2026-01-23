import { makeStep } from '$lib/components/stepper/types';
import EnterReason from './enter-reason.svelte';
import ReportSuccess from './report-success.svelte';

export default (targetType: 'repo' | 'user' | 'issue', targetId: string) => ({
  steps: [
    makeStep({
      component: EnterReason,
      props: {
        targetType,
        targetId,
      },
    }),
    makeStep({
      component: ReportSuccess,
      props: {},
    }),
  ],
});
