<script lang="ts" module>
  export const REVIEW_STEP_UNCLAIMED_ORCID_FRAGMENT = gql`
    ${UNCLAIMED_ORCID_CARD_FRAGMENT}
    fragment ReviewStepUnclaimedOrcid on OrcidLinkedIdentity {
      ...UnclaimedOrcidCard
    }
  `;
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import { createEventDispatcher } from 'svelte';
  import { type StepComponentEvents } from '$lib/components/stepper/types';
  import WalletIcon from '$lib/components/icons/Wallet.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import SplitsIcon from '$lib/components/icons/Splits.svelte';
  import EyeOpenIcon from '$lib/components/icons/EyeOpen.svelte';
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import unreachable from '$lib/utils/unreachable';
  import { type Writable } from 'svelte/store';
  import type { State } from '../../claim-orcid-flow';
  import PenIcon from '$lib/components/icons/Pen.svelte';
  import { gql } from 'graphql-request';
  import Download from '$lib/components/icons/Download.svelte';
  import network from '$lib/stores/wallet/network';

  import WhatsNextSection from '$lib/components/whats-next/whats-next-section.svelte';
  import WhatsNextCard from '$lib/components/whats-next/whats-next-card.svelte';
  import WhatsNextItem from '$lib/components/whats-next/whats-next-item.svelte';
  import UnclaimedOrcidCard, {
    UNCLAIMED_ORCID_CARD_FRAGMENT,
  } from '../../../../../routes/(pages)/app/(app)/orcids/[orcidId]/components/unclaimed-orcid-card.svelte';
  import type { MergeWithdrawableBalancesFragment } from '$lib/utils/__generated__/gql.generated';
  import OrcidProfileHeader from '../../../../../routes/(pages)/app/(app)/orcids/[orcidId]/components/orcid-profile-header.svelte';
  import type { OrcidProfileHeaderFragment } from '../../../../../routes/(pages)/app/(app)/orcids/[orcidId]/components/__generated__/gql.generated';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
    canEditWalletConnection?: boolean;
  }

  let { context, canEditWalletConnection = true }: Props = $props();

  let orcidProfile = $derived($context.claimableMetadata ?? unreachable());
  let orcidAccount = $derived($context.claimableAccount ?? unreachable());

  // For previewing what the ORCID will look like after claiming
  let fakeClaimedOrcid: OrcidProfileHeaderFragment = $derived({
    __typename: 'OrcidLinkedIdentity',
    orcid: orcidAccount.orcid,
    chain: network.gqlName,
    owner: {
      __typename: 'AddressDriverAccount',
      address: $walletStore.address ?? unreachable(),
    },
    orcidMetadata: orcidAccount.orcidMetadata,
    areSplitsValid: false,
    isClaimed: false,
  });

  async function submit() {
    dispatch('goForward');
  }

  let withdrawableBalances: MergeWithdrawableBalancesFragment[] =
    $context.claimableAccount?.withdrawableBalances ?? [];

  let hasCollectableAmount = $derived(
    withdrawableBalances.filter((wb) => BigInt(wb.collectableAmount) > 0n).length > 0,
  );
  let hasSplittableAmount = $derived(
    withdrawableBalances.filter((wb) => BigInt(wb.splittableAmount) > 0n).length > 0,
  );
</script>

<StandaloneFlowStepLayout
  headline="Review"
  description="You’re almost done claiming your ORCID and funds. Please review all details."
>
  <FormField type="div" title="ORCID iD">
    <div class="card">
      <OrcidProfileHeader orcid={orcidProfile} orcidAccount={fakeClaimedOrcid} />
    </div>
  </FormField>
  <FormField type="div" title="Owned by">
    {#snippet action()}
      {#if canEditWalletConnection}
        <Button variant="ghost" onclick={() => dispatch('goForward', { by: -5 })} icon={PenIcon}
          >Edit</Button
        >
      {/if}
    {/snippet}
    <AccountBox hideDisconnect />
  </FormField>
  <FormField type="div" title="Claimable funds">
    <UnclaimedOrcidCard
      detailedTokenBreakdown={hasCollectableAmount && hasSplittableAmount}
      {orcidAccount}
    />
  </FormField>
  <WhatsNextSection>
    {#if hasCollectableAmount || hasSplittableAmount}
      <WhatsNextCard>
        {#snippet title()}
          On transaction confirmation...
        {/snippet}
        {#snippet items()}
          {#if hasCollectableAmount && hasSplittableAmount}
            <WhatsNextItem icon={Download}
              >Some of your claimable funds will be <span class="typo-text-bold"
                >collected directly to your connected wallet</span
              > as shown above.</WhatsNextItem
            >
            <WhatsNextItem icon={SplitsIcon}
              >Remaining claimable funds will be <span class="typo-text-bold"
                >immediately split</span
              > as shown above.</WhatsNextItem
            >
          {:else if hasCollectableAmount}
            <WhatsNextItem icon={SplitsIcon}
              >Claimable funds will be<span class="typo-text-bold"
                >collected directly to your connected wallet</span
              > as shown above.</WhatsNextItem
            >
          {:else if hasSplittableAmount}
            <WhatsNextItem icon={SplitsIcon}
              >All claimable funds will be <span class="typo-text-bold"
                >immediately split as shown above</span
              >.</WhatsNextItem
            >
          {/if}
        {/snippet}
      </WhatsNextCard>
    {/if}
    <WhatsNextCard>
      {#snippet title()}
        After transaction confirmation...
      {/snippet}
      {#snippet items()}
        <WhatsNextItem icon={EyeOpenIcon}
          >Anyone can support or split to your ORCID on Drips.</WhatsNextItem
        >
        <WhatsNextItem icon={WalletIcon}
          >You can <span class="typo-text-bold">collect your tokens</span> from your
          <span class="typo-text-bold">Drips dashboard</span>.</WhatsNextItem
        >
      {/snippet}
    </WhatsNextCard>
  </WhatsNextSection>
  {#snippet left_actions()}
    <Button icon={ArrowLeft} onclick={() => dispatch('goBackward')}>Back</Button>
  {/snippet}
  {#snippet actions()}
    <Button icon={WalletIcon} variant="primary" onclick={submit}>Confirm in wallet</Button>
  {/snippet}
</StandaloneFlowStepLayout>
