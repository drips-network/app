<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import modal from '$lib/stores/modal';
  import type { GrantDto } from '$lib/utils/wave/types/grant';
  import type { Writable } from 'svelte/store';
  import type { State } from './test-transaction-flow';
  import StellarAddressInput from '$lib/components/wave/rewards/stellar-address-input.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    grant: GrantDto;
    context: Writable<State>;
  }

  let { grant, context }: Props = $props();

  let stellarAddress = $state('');
  let addressValid = $state(false);
  let memo = $state('');

  let canSubmit = $derived(addressValid);

  function handleSubmit() {
    $context.stellarAddress = stellarAddress;
    $context.memo = memo || undefined;
    dispatch('goForward');
  }
</script>

<StandaloneFlowStepLayout
  headline="Request test transaction"
  description="We'll send $1 to verify your wallet can receive USDC on Stellar. Test transactions will usually be processed within a few minutes, but may take up to 3 days in rare cases."
>
  <AnnotationBox type="info">
    Make sure your wallet supports USDC on the Stellar network and has the USDC trustline enabled
    before requesting a test transaction.
  </AnnotationBox>

  <div class="fields">
    <FormField title="Grant" type="div">
      <div class="info-box">
        <span class="typo-text-bold">{grant.waveProgramName} Wave {grant.waveNumber}</span>
        <span class="amount">${grant.currentAmountUSD.toLocaleString()} USD</span>
      </div>
    </FormField>

    <FormField title="Test amount" type="div">
      <div class="info-box">
        <span class="typo-text-bold">$1</span>
      </div>
    </FormField>

    <FormField
      title="Stellar address*"
      description="Enter your Stellar wallet address (starts with G)."
      type="div"
    >
      <StellarAddressInput bind:value={stellarAddress} bind:isValid={addressValid} />
    </FormField>

    <FormField
      title="Memo"
      description="If the recipient address requires a memo, enter it here. If you have a memo and don't enter it, the transaction may be lost."
      type="div"
    >
      <TextInput bind:value={memo} placeholder="Enter memo" />
    </FormField>
  </div>

  {#snippet left_actions()}
    <Button variant="normal" onclick={modal.hide}>Cancel</Button>
  {/snippet}

  {#snippet actions()}
    <Button variant="primary" disabled={!canSubmit} onclick={handleSubmit} icon={ArrowRight}>
      Continue
    </Button>
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
