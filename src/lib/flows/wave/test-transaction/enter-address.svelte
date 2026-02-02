<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import modal from '$lib/stores/modal';
  import { requestTestTransaction } from '$lib/utils/wave/grants';
  import type { GrantDto } from '$lib/utils/wave/types/grant';
  import StellarAddressInput from '$lib/components/wave/rewards/stellar-address-input.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    grant: GrantDto;
  }

  let { grant }: Props = $props();

  let stellarAddress = $state('');
  let addressValid = $state(false);
  let confirmed = $state(false);

  let canSubmit = $derived(addressValid && confirmed);

  function handleSubmit() {
    dispatch('await', {
      message: 'Requesting test transaction…',
      promise: async () => {
        await requestTestTransaction(undefined, grant.id, stellarAddress);
        await invalidate('wave:rewards');
      },
    });
  }
</script>

<StandaloneFlowStepLayout
  headline="Request test transaction"
  description="We'll send $1 to verify your wallet can receive USDC on Stellar. Once requested, transfers will be made within seven days."
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

    <div class="confirmation">
      <Checkbox bind:checked={confirmed} />
      <div class="confirmation-text typo-text-small">
        <span>I confirm that:</span>
        <ul>
          <li>My wallet can receive USDC on the Stellar network</li>
          <li>I have enabled the USDC trustline in my wallet</li>
          <li>
            I understand that Drips is not responsible for funds sent to an incorrect or
            incompatible wallet address
          </li>
          <li>
            I understand that Drips is not responsible for any funds lost due to inherent blockchain
            risks
          </li>
        </ul>
      </div>
    </div>
  </div>

  {#snippet actions()}
    <Button variant="normal" onclick={modal.hide}>Cancel</Button>
    <Button variant="primary" disabled={!canSubmit} onclick={handleSubmit}>Request test</Button>
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

  .confirmation {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 1rem;
    background-color: var(--color-caution-level-1);
    border-radius: 0.75rem;
    text-align: left;
  }

  .confirmation-text {
    color: var(--color-foreground);
    text-align: left;
  }

  .confirmation-text ul {
    margin: 0.5rem 0 0 0;
    padding: 0 0 0 1.25rem;
    list-style-type: disc;
  }

  .confirmation-text li {
    margin-bottom: 0.375rem;
    padding-left: 0.25rem;
  }

  .confirmation-text li::marker {
    color: var(--color-foreground-level-4);
  }
</style>
