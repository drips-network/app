<script lang="ts" module>
  import {
    DRIP_VISUAL_ADDRESS_DRIVER_ACCOUNT_FRAGMENT,
    DRIP_VISUAL_ECOSYSTEM_FRAGMENT,
    DRIP_VISUAL_NFT_DRIVER_ACCOUNT_FRAGMENT,
    DRIP_VISUAL_PROJECT_FRAGMENT,
    DRIP_VISUAL_ORCID_FRAGMENT,
    DRIP_VISUAL_USER_FRAGMENT,
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

  export const CREATE_DONATION_DETAILS_STEP_ECOSYSTEM_FRAGMENT = gql`
    ${DRIP_VISUAL_ECOSYSTEM_FRAGMENT}
    fragment CreateDonationDetailsStepEcosystem on EcosystemMainAccount {
      ...DripVisualEcosystem
      account {
        accountId
      }
    }
  `;

  export const CREATE_DONATION_DETAILS_STEP_ORCID_FRAGMENT = gql`
    ${DRIP_VISUAL_ORCID_FRAGMENT}
    fragment CreateDonationDetailsStepOrcid on OrcidLinkedIdentity {
      ...DripVisualOrcid
      account {
        accountId
      }
    }
  `;

  export const CREATE_DONATION_DETAILS_STEP_USER_FRAGMENT = gql`
    ${DRIP_VISUAL_USER_FRAGMENT}
    fragment CreateDonationDetailsStepUser on User {
      ...DripVisualUser
      account {
        accountId
      }
    }
  `;
</script>

<script lang="ts">
  import { run } from 'svelte/legacy';

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
    CreateDonationDetailsStepEcosystemFragment,
    CreateDonationDetailsStepOrcidFragment,
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

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<CreateDonationFlowState>;
    receiver:
      | CreateDonationDetailsStepAddressDriverAccountFragment
      | CreateDonationDetailsStepNftDriverAccountFragment
      | CreateDonationDetailsStepProjectFragment
      | CreateDonationDetailsStepEcosystemFragment
      | CreateDonationDetailsStepOrcidFragment;
  }

  let { context, receiver }: Props = $props();

  let selectedTokenAllowance: bigint | undefined = $state();

  let formValid = $state(false);

  let amount: bigint | undefined = $state();

  let selectedTokenAddress = $derived($context.selectedTokenAddress?.[0]);
  let selectedToken = $derived(
    selectedTokenAddress ? tokensStore.getByAddress(selectedTokenAddress) : null,
  );

  let receiverTypeLabel = $state('Drip List');
  run(() => {
    switch (receiver.__typename) {
      case 'Project':
        receiverTypeLabel = 'Drips project';
        break;
      case 'EcosystemMainAccount':
        receiverTypeLabel = 'Ecosystem';
        break;
      case 'OrcidLinkedIdentity':
        receiverTypeLabel = 'ORCID';
        break;
      case 'AddressDriverAccount':
        receiverTypeLabel = 'Address';
        break;
    }
  });

  function submit() {
    let recipientAccountId: string;
    switch (receiver.__typename) {
      case 'AddressDriverAccount':
      case 'NftDriverAccount':
        recipientAccountId = receiver.accountId;
        break;
      case 'Project':
      case 'EcosystemMainAccount':
      case 'OrcidLinkedIdentity':
        recipientAccountId = receiver.account.accountId;
        break;
    }

    createDonation(
      dispatch,
      recipientAccountId,
      receiver,
      selectedTokenAddress ?? unreachable(),
      amount ?? unreachable(),
      selectedTokenAllowance ?? unreachable(),
      $context.amountInputValue,
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
    {@const nextSettlementDate = network.settlement.nextSettlementDate}
    <TransitionedHeight collapsed={!formValid} negativeMarginWhileCollapsed="-1rem">
      <WhatsNextSection>
        <WhatsNextCard>
          {#snippet title()}
            On transaction confirmation...
          {/snippet}
          {#snippet items()}
            <WhatsNextItem icon={TransactionsIcon}
              >{amount ? formatTokenAmount(amount, selectedToken.info.decimals, 1n, false) : ''}
              {selectedToken?.info.symbol} will be
              <span class="typo-text-bold">immediately sent from your wallet</span>
              to this {receiverTypeLabel}.</WhatsNextItem
            >
          {/snippet}
        </WhatsNextCard>
        <WhatsNextCard>
          {#snippet title()}
            After your donation...
          {/snippet}
          {#snippet items()}
            {#if receiver.__typename === 'OrcidLinkedIdentity'}
              <WhatsNextItem icon={CalendarIcon}>
                Funds sent to {receiverTypeLabel}s on {network.label} are distributed to its owner on
                <span class="typo-text-bold"
                  >{nextSettlementDate === 'daily'
                    ? 'today'
                    : formatDate(nextSettlementDate())}</span
                >.
              </WhatsNextItem>
            {:else}
              <WhatsNextItem icon={TransactionsIcon}>
                Funds sent to {receiverTypeLabel}s on {network.label} are distributed among its recipients
                <span class="typo-text-bold">{network.settlement.frequencyLabel}</span>.
              </WhatsNextItem>
              <WhatsNextItem icon={CalendarIcon}>
                The next date that accumulated funds will be distributed is <span
                  class="typo-text-bold"
                  >{nextSettlementDate === 'daily'
                    ? 'today'
                    : formatDate(nextSettlementDate())}</span
                >.
              </WhatsNextItem>
            {/if}
          {/snippet}
        </WhatsNextCard>
      </WhatsNextSection>
    </TransitionedHeight>
  {/if}

  {#snippet actions()}
    <Button onclick={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button variant="primary" icon={WalletIcon} onclick={submit} disabled={!formValid}
      >Confirm in your wallet</Button
    >
  {/snippet}
</StepLayout>
