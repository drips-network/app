<script lang="ts">
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ArrowRightIcon from 'radicle-design-system/icons/ArrowRight.svelte';
  import ArrowLeftIcon from 'radicle-design-system/icons/ArrowLeft.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Button from '$lib/components/button/button.svelte';
  import DripListService from '$lib/utils/driplist/DripListService';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let hasDripList: boolean | undefined;

  async function updateHasDripList() {
    if (!$walletStore.connected) return;

    const dripListService = await DripListService.new();

    const dripLists = await dripListService.getByOwnerAddress($walletStore.address);

    hasDripList = Boolean(dripLists[0]);
  }

  $: {
    if ($walletStore.connected) {
      updateHasDripList();
    } else {
      hasDripList = undefined;
    }
  }

  $: formValid = $walletStore.connected && hasDripList === false;
</script>

<StandaloneFlowStepLayout
  headline="Connect your wallet"
  description="The wallet you connect will own the Drip List, and be able to edit it in the future."
>
  <FormField type="div">
    <AccountBox />
    {#if hasDripList}
      <div style:margin-top="16px">
        <AnnotationBox type="warning">
          This wallet already has a Drip List. Connect a different wallet or edit your current Drip
          List from your <a href="/app/drip-lists" class="underline">dashboard</a>.
        </AnnotationBox>
      </div>
    {/if}
    {#if Boolean($walletStore.safe)}
      <div style:margin-top="16px">
        <SafeAppDisclaimer disclaimerType="drips" />
      </div>
    {/if}
  </FormField>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeftIcon} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!formValid}
      icon={ArrowRightIcon}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>
