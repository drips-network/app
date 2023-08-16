<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Check from 'radicle-design-system/icons/Check.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import ArrowLeftIcon from 'radicle-design-system/icons/ArrowLeft.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../funder-onboarding-flow';
  import SupportStreamEditor from '$lib/components/support-stream-editor/support-stream-editor.svelte';
  import DripListService from '$lib/utils/driplist/DripListService';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

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

  let formValid: boolean;
</script>

<StandaloneFlowStepLayout description="Set up a stream to support the projects on your Drip List.">
  <AnnotationBox type="info">
    <div class="support-type-explainer">
      <h4 class="typo-text-small-bold">Support monthly with token streaming</h4>
      <ul>
        <li>Stream a custom amount of any ERC-20 token</li>
        <li>Cancel, pause or edit the stream rate anytime</li>
        <li>Top up or withdraw tokens from your stream balance anytime</li>
      </ul>
    </div>
  </AnnotationBox>
  <FormField type="div" title="Wallet">
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
  <SupportStreamEditor
    disabled={hasDripList}
    bind:formValid
    bind:streamRateValueParsed={$context.supportConfig.streamRateValueParsed}
    bind:topUpAmountValueParsed={$context.supportConfig.topUpAmountValueParsed}
    bind:selectedTokenAddress={$context.supportConfig.listSelected[0]}
  />
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeftIcon} on:click={() => dispatch('goBackward')}>Go back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!formValid || hasDripList === undefined || hasDripList === true}
      icon={Check}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .support-type-explainer h4 {
    margin-bottom: 0.5rem;
  }

  .support-type-explainer ul li {
    list-style-type: disc;
    list-style-position: inside;
  }
</style>
