import { makeStep } from '$lib/components/stepper/types';
import ShareUrl from './steps/share-url.svelte';

type ShareUrlProps = {
  url: string;
  downloadableImageUrl?: string;
  text?: string;
};

// import SuccessStep from '$lib/components/success-step/success-step.svelte';
// import { get } from 'svelte/store';
// import walletStore from '$lib/stores/wallet/wallet.store';
// import SetNewMetadata, { SET_NEW_METADATA_STEP_FRAGMENT } from './steps/set-new-metadata.svelte';
// import { gql } from 'graphql-request';
// import type { EditProjectMetadataFlowFragment } from './__generated__/gql.generated';

// export const EDIT_PROJECT_METADATA_FLOW_FRAGMENT = gql`
//   ${SET_NEW_METADATA_STEP_FRAGMENT}
//   fragment EditProjectMetadataFlow on Project {
//     ...SetNewMetadataStep
//   }
// `;

export default (props: ShareUrlProps) => ({
  context: undefined,
  steps: [
    makeStep({
      component: ShareUrl,
      props,
    }),
    // makeStep({
    //   component: SuccessStep,
    //   props: {
    //     safeAppMode: Boolean(get(walletStore).safe),
    //     message: 'Your project has successfully been updated.',
    //   },
    // }),
  ],
});
