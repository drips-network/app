<script lang="ts">
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ArrowRightIcon from '$lib/components/icons/ArrowRight.svelte';
  import ArrowLeftIcon from '$lib/components/icons/ArrowLeft.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let formValid = $derived($walletStore.connected);
</script>

<StandaloneFlowStepLayout
  headline="Connect your wallet"
  description="The wallet you connect will own the Drip List, and be able to edit it in the future."
>
  <FormField type="div">
    <AccountBox />
    {#if Boolean($walletStore.safe)}
      <div style:margin-top="16px">
        <SafeAppDisclaimer disclaimerType="drips" />
      </div>
    {/if}
  </FormField>

  {#snippet left_actions()}
    <Button icon={ArrowLeftIcon} onclick={() => dispatch('goBackward')}>Back</Button>
  {/snippet}
  {#snippet actions()}
    <Button
      disabled={!formValid}
      icon={ArrowRightIcon}
      variant="primary"
      onclick={() => dispatch('goForward')}>Continue</Button
    >
  {/snippet}
</StandaloneFlowStepLayout>
