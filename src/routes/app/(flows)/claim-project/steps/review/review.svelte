<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import WalletIcon from 'radicle-design-system/icons/Wallet.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import UlIconLi from '$lib/components/ul-icon-li/ul-icon-li.svelte';
  import SplitsIcon from 'radicle-design-system/icons/Splits.svelte';
  import EyeOpenIcon from 'radicle-design-system/icons/EyeOpen.svelte';
  import TokenStreamsIcon from 'radicle-design-system/icons/TokenStreams.svelte';
  import AccountBox from '$lib/components/account-box/account-box.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();
</script>

<StandaloneFlowStepLayout
  headline="Review"
  description="You’re almost done claiming your project and funds. Please review all details."
>
  <FormField type="div" title="Git project" />
  <FormField type="div" title="Owned by">
    <AccountBox hideDisconnect />
  </FormField>
  <FormField type="div" title="Claimable funds" />
  <FormField type="div" title="Split funds with" />
  <div class="whats-next">
    <div class="card">
      <h4>On transaction confirmation…</h4>
      <ul>
        <UlIconLi icon={SplitsIcon}
          >All claimable funds will be <span class="typo-text-bold"
            >immediately split as shown above</span
          >.</UlIconLi
        >
      </ul>
    </div>
    <div class="card">
      <h4>After transaction confirmation…</h4>
      <ul>
        <UlIconLi icon={EyeOpenIcon}>Anyone can support or split to your project on Drips.</UlIconLi
        >
        <UlIconLi icon={WalletIcon}
          >You can <span class="typo-text-bold">collect your tokens</span> from your
          <span class="typo-text-bold">Drips dashboard</span>.</UlIconLi
        >
        <UlIconLi icon={TokenStreamsIcon}
          >Future incoming funds will be split to your recipients <span class="typo-text-bold"
            >weekly</span
          >.</UlIconLi
        >
      </ul>
    </div>
  </div>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Go back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button disabled={true} icon={WalletIcon} variant="primary">Confirm in wallet</Button>
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .card {
    background-color: var(--color-background);
    padding: 1rem;
    box-shadow: var(--elevation-low);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .whats-next {
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }
</style>
