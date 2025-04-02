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
  import WhatsNextSection from '$lib/components/whats-next/whats-next-section.svelte';
  import WhatsNextCard from '$lib/components/whats-next/whats-next-card.svelte';
  import WhatsNextItem from '$lib/components/whats-next/whats-next-item.svelte';
  import TransactionsIcon from '$lib/components/icons/Transactions.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import WalletIcon from '$lib/components/icons/Wallet.svelte';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import network from '$lib/stores/wallet/network';
  import CalendarIcon from '$lib/components/icons/Calendar.svelte';
  import formatDate from '$lib/utils/format-date';
  import type { CreateDonationDetailsStepEcosystemFragment } from './create-donation-flow-steps';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<CreateDonationFlowState>;

  export let receiver:
    | CreateDonationDetailsStepAddressDriverAccountFragment
    | CreateDonationDetailsStepNftDriverAccountFragment
    | CreateDonationDetailsStepProjectFragment
    | CreateDonationDetailsStepEcosystemFragment;

  let selectedTokenAllowance: bigint | undefined;

  let formValid: boolean;

  let amount: bigint | undefined;

  $: selectedTokenAddress = $context.selectedTokenAddress?.[0];
  $: selectedToken = selectedTokenAddress ? tokensStore.getByAddress(selectedTokenAddress) : null;

  function submit() {
    let recipientAccountId: string;
    switch (receiver.__typename) {
      case 'AddressDriverAccount':
      case 'NftDriverAccount':
      case 'Ecosystem':
        recipientAccountId = receiver.accountId;
        break;
      case 'Project':
        recipientAccountId = receiver.account.accountId;
        break;
    }

    createDonation(
      dispatch,
      recipientAccountId,
      receiver.__typename,
      selectedTokenAddress ?? unreachable(),
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

  {#if amount && selectedToken}
    {@const receiverTypeLabel = receiver.__typename === 'Project' ? 'Drips project' : 'Drip List'}
    {@const nextSettlementDate = network.settlement.nextSettlementDate}
    <TransitionedHeight collapsed={!formValid} negativeMarginWhileCollapsed="-1rem">
      <WhatsNextSection>
        <WhatsNextCard>
          <svelte:fragment slot="title">On transaction confirmation...</svelte:fragment>
          <svelte:fragment slot="items">
            <WhatsNextItem icon={TransactionsIcon}
              >{formatTokenAmount(amount, selectedToken.info.decimals, 1n, false)}
              {selectedToken?.info.symbol} will be
              <span class="typo-text-bold">immediately sent from your wallet</span>
              to this {receiverTypeLabel}.</WhatsNextItem
            >
          </svelte:fragment>
        </WhatsNextCard>
        <WhatsNextCard>
          <svelte:fragment slot="title">After your donation...</svelte:fragment>
          <svelte:fragment slot="items">
            <WhatsNextItem icon={TransactionsIcon}>
              Funds sent to {receiverTypeLabel}s on {network.label} are distributed among its recipients
              <span class="typo-text-bold">{network.settlement.frequencyLabel}</span>.
            </WhatsNextItem>
            <WhatsNextItem icon={CalendarIcon}>
              The next date that accumulated funds will be distributed is <span
                class="typo-text-bold"
                >{nextSettlementDate === 'daily' ? 'today' : formatDate(nextSettlementDate())}</span
              >.
            </WhatsNextItem>
          </svelte:fragment>
        </WhatsNextCard>
      </WhatsNextSection>
    </TransitionedHeight>
  {/if}

  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button variant="primary" icon={WalletIcon} on:click={submit} disabled={!formValid}
      >Confirm in your wallet</Button
    >
  </svelte:fragment>
</StepLayout>
