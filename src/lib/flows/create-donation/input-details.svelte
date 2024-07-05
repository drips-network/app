<script lang="ts" context="module">
  import {
    DRIP_VISUAL_ADDRESS_DRIVER_ACCOUNT_FRAGMENT,
    DRIP_VISUAL_NFT_DRIVER_ACCOUNT_FRAGMENT,
    DRIP_VISUAL_PROJECT_FRAGMENT,
  } from '$lib/components/drip-visual/drip-visual.svelte';

  export const CREATE_DONATION_DETAILS_STEP_ADDRESS_DRIVER_ACCOUNT_FRAGMENT = gql`
    ${DRIP_VISUAL_ADDRESS_DRIVER_ACCOUNT_FRAGMENT}
    fragment CreateDonationDetailsStepAddressDriverAccount on AddressDriverAccount {
      ...DripVisualAddressDriverAccount
      accountId
    }
  `;

  export const CREATE_DONATION_DETAILS_STEP_NFT_DRIVER_ACCOUNT_FRAGMENT = gql`
    ${DRIP_VISUAL_NFT_DRIVER_ACCOUNT_FRAGMENT}
    fragment CreateDonationDetailsStepNftDriverAccount on NftDriverAccount {
      ...DripVisualNftDriverAccount
    }
  `;

  export const CREATE_DONATION_DETAILS_STEP_PROJECT_FRAGMENT = gql`
    ${DRIP_VISUAL_PROJECT_FRAGMENT}
    fragment CreateDonationDetailsStepProject on Project {
      ...DripVisualProject
      account {
        accountId
      }
    }
  `;
</script>

<script lang="ts">
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import Button from '$lib/components/button/button.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import wallet from '$lib/stores/wallet/wallet.store';
  import DripVisual from '$lib/components/drip-visual/drip-visual.svelte';
  import type { Writable } from 'svelte/store';
  import type { CreateDonationFlowState } from './create-donation-flow-state';
  import createDonation from './methods/create-donation';
  import unreachable from '$lib/utils/unreachable';
  import { gql } from 'graphql-request';
  import type {
    CreateDonationDetailsStepAddressDriverAccountFragment,
    CreateDonationDetailsStepNftDriverAccountFragment,
    CreateDonationDetailsStepProjectFragment,
  } from './__generated__/gql.generated';
  import OneTimeDonationEditor from '$lib/components/one-time-donation-editor/one-time-donation-editor.svelte';
  import { Driver } from '$lib/graphql/__generated__/base-types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<CreateDonationFlowState>;

  export let receiver:
    | CreateDonationDetailsStepAddressDriverAccountFragment
    | CreateDonationDetailsStepNftDriverAccountFragment
    | CreateDonationDetailsStepProjectFragment;

  let selectedTokenAllowance: bigint | undefined;

  let formValid: boolean;

  let amount: bigint | undefined;

  function submit() {
    let recipientAccountId: string;
    switch (receiver.__typename) {
      case 'AddressDriverAccount':
      case 'NftDriverAccount':
        recipientAccountId = receiver.accountId;
        break;
      case 'ClaimedProject':
      case 'UnclaimedProject':
        recipientAccountId = receiver.account.accountId;
        break;
    }

    createDonation(
      dispatch,
      recipientAccountId,
      $context.selectedTokenAddress?.[0] ?? unreachable(),
      amount ?? unreachable(),
      selectedTokenAllowance ?? unreachable(),
    );
  }
</script>

<StepLayout>
  <DripVisual
    disableLinks
    visual="donation"
    from={$wallet.address
      ? {
          __typename: 'AddressDriverAccount',
          driver: Driver.Address,
          address: $wallet.address,
        }
      : undefined}
    to={receiver}
    halted={!formValid}
  />
  <StepHeader
    headline="Donate instantly"
    description="Choose a token and how much you would like to donate."
  />
  <OneTimeDonationEditor
    bind:formValid
    bind:amountInputValue={$context.amountInputValue}
    bind:topUpMax={$context.topUpMax}
    bind:selectedTokenAddress={$context.selectedTokenAddress}
    bind:amount
    bind:selectedTokenAllowance
  />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button variant="primary" on:click={submit} disabled={!formValid}>Confirm in your wallet</Button
    >
  </svelte:fragment>
</StepLayout>
