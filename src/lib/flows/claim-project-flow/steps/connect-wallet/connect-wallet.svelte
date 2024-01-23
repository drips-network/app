<script lang="ts">
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ArrowRightIcon from 'radicle-design-system/icons/ArrowRight.svelte';
  import ArrowLeftIcon from 'radicle-design-system/icons/ArrowLeft.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  $: formValid = $walletStore.connected;

  function verifyProject() {
    dispatch('goForward');
  }
</script>

<StandaloneFlowStepLayout
  headline="Connect your wallet"
  description="If you maintain this GitHub project, connect an Ethereum wallet that will control funds and manage the project's Drips profile."
>
  <FormField type="div" title="Project Owner Ethereum Address">
    <AccountBox />
  </FormField>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeftIcon} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button disabled={!formValid} icon={ArrowRightIcon} variant="primary" on:click={verifyProject}
      >Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
