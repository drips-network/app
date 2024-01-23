import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import { get } from 'svelte/store';
import walletStore from '$lib/stores/wallet/wallet.store';
import SetNewMetadata, { SET_NEW_METADATA_STEP_FRAGMENT } from './steps/set-new-metadata.svelte';
import { gql } from 'graphql-request';
import type { EditProjectMetadataFlowFragment } from './__generated__/gql.generated';

export const EDIT_PROJECT_METADATA_FLOW_FRAGMENT = gql`
  ${SET_NEW_METADATA_STEP_FRAGMENT}
  fragment EditProjectMetadataFlow on ClaimedProject {
    ...SetNewMetadataStep
  }
`;

export default (project: EditProjectMetadataFlowFragment) => ({
  context: undefined,
  steps: [
    makeStep({
      component: SetNewMetadata,
      props: {
        project,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your project has successfully been updated. Please refresh the page to see the changes.',
      },
    }),
  ],
});
