<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import modal from '$lib/stores/modal';
  import type { GrantDto } from '$lib/utils/wave/types/grant';
  import type { Writable } from 'svelte/store';
  import type { State } from './withdrawal-flow';
  import StellarAddressInput from '$lib/components/wave/rewards/stellar-address-input.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    grant: GrantDto;
    context: Writable<State>;
  }

  let { grant, context }: Props = $props();

  let stellarAddress = $state('');
  let addressValid = $state(false);

  let canSubmit = $derived(addressValid);

  function handleSubmit() {
    $context.stellarAddress = stellarAddress;
    dispatch('goForward');
  }
</script>

<StandaloneFlowStepLayout
  headline="Request full withdrawal"
  description="Withdraw your grant funds to your Stellar wallet as USDC. Once requested, transfers will be made within seven days."
>
  <AnnotationBox type="info">
    Make sure your wallet supports USDC on the Stellar network and has the USDC trustline enabled.
  </AnnotationBox>

  <div class="fields">
    <FormField title="Withdrawal amount" type="div">
      <div class="info-box">
        <span class="typo-text-bold">{grant.waveProgramName} Wave {grant.waveNumber}</span>
        <span class="amount">${grant.currentAmountUSD.toLocaleString()} USD</span>
      </div>
    </FormField>

    <FormField
      title="Stellar address*"
      description="Enter your Stellar wallet address (starts with G)."
      type="div"
    >
      <StellarAddressInput bind:value={stellarAddress} bind:isValid={addressValid} />
    </FormField>
  </div>

  {#snippet actions()}
    <Button variant="normal" onclick={modal.hide}>Cancel</Button>
    <Button variant="primary" disabled={!canSubmit} onclick={handleSubmit}>Continue</Button>
  {/snippet}
</StandaloneFlowStepLayout>

<style>
  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--color-foreground-level-1);
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
  }

  .amount {
    color: var(--color-foreground-level-5);
    font-feature-settings: 'tnum';
  }
</style>
