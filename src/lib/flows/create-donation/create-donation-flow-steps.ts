import { makeStep } from '$lib/components/stepper/types';
import SuccessStep from '$lib/components/success-step/success-step.svelte';
import walletStore from '$lib/stores/wallet/wallet.store';
import { get } from 'svelte/store';
import createDonationFlowState from './create-donation-flow-state';
import InputDetails, {
  CREATE_DONATION_DETAILS_STEP_NFT_DRIVER_ACCOUNT_FRAGMENT,
  CREATE_DONATION_DETAILS_STEP_PROJECT_FRAGMENT,
} from './input-details.svelte';
import type {
  CreateDonationDetailsStepNftDriverAccountFragment,
  CreateDonationDetailsStepProjectFragment,
} from './__generated__/gql.generated';
import { gql } from 'graphql-request';

export const CREATE_DONATION_FLOW_DRIP_LIST_FRAGMENT = gql`
  ${CREATE_DONATION_DETAILS_STEP_NFT_DRIVER_ACCOUNT_FRAGMENT}
  fragment CreateDonationFlowDripList on DripList {
    account {
      ...CreateDonationDetailsStepNftDriverAccount
    }
  }
`;

export const CREATE_DONATION_FLOW_PROJECT_FRAGMENT = gql`
  ${CREATE_DONATION_DETAILS_STEP_PROJECT_FRAGMENT}
  fragment CreateDonationFlowProject on Project {
    ...CreateDonationDetailsStepProject
  }
`;

export default (
  receiver:
    | CreateDonationDetailsStepNftDriverAccountFragment
    | CreateDonationDetailsStepProjectFragment,
) => ({
  context: createDonationFlowState,
  steps: [
    makeStep({
      component: InputDetails,
      props: {
        receiver,
      },
    }),
    makeStep({
      component: SuccessStep,
      props: {
        safeAppMode: Boolean(get(walletStore).safe),
        message:
          'Your donation has been sent. ' +
          'Please note that it may take a while for your dashboard to update.',
      },
    }),
  ],
});
