<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import { requestWithdrawal } from '$lib/utils/wave/grants';
  import type { GrantDto } from '$lib/utils/wave/types/grant';
  import type { Writable } from 'svelte/store';
  import type { State } from './withdrawal-flow';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    grant: GrantDto;
    context: Writable<State>;
  }

  let { grant, context }: Props = $props();

  let confirmed = $state(false);

  let canSubmit = $derived(confirmed);

  function handleSubmit() {
    dispatch('await', {
      message: 'Requesting withdrawal…',
      promise: async () => {
        await requestWithdrawal(
          undefined,
          grant.id,
          $context.stellarAddress,
          $context.memo ? 'text' : undefined,
          $context.memo,
        );
        await invalidate('wave:rewards');
      },
    });
  }

  function handleBack() {
    dispatch('goBackward');
  }
</script>

<StandaloneFlowStepLayout
  headline="Confirm withdrawal"
  description="Please review the details below and confirm."
>
  <AnnotationBox type="warning">
    Once submitted, withdrawals cannot be cancelled or modified. Please double-check all details.
  </AnnotationBox>

  <div class="fields">
    <FormField title="Grant" type="div">
      <div class="info-box">
        <span class="typo-text-bold">{grant.waveProgramName} Wave {grant.waveNumber}</span>
      </div>
    </FormField>

    <FormField title="Withdrawal amount" type="div">
      <div class="info-box">
        <span class="typo-text-bold">${grant.currentAmountUSD.toLocaleString()} USD</span>
      </div>
    </FormField>

    <FormField title="Destination address" type="div">
      <div class="info-box address">
        <span class="typo-text-mono">{$context.stellarAddress}</span>
      </div>
    </FormField>

    <FormField title="Memo" type="div">
      <div class="info-box">
        {#if $context.memo}
          <span class="typo-text-mono">{$context.memo}</span>
        {:else}
          <span class="no-memo">No memo</span>
        {/if}
      </div>
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
          <li>
            I have read and accept the <a
              href="https://docs.drips.network/wave/terms-and-rules"
              target="_blank"
              rel="noopener noreferrer"
              class="typo-link terms-link">Drips Wave Terms and Rules</a
            >
          </li>
        </ul>
      </div>
    </div>
  </div>

  {#snippet left_actions()}
    <Button variant="normal" onclick={handleBack} icon={ArrowLeft}>Back</Button>
  {/snippet}

  {#snippet actions()}
    <Button variant="primary" disabled={!canSubmit} onclick={handleSubmit} icon={CheckCircle}>
      Confirm & Request
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

  .info-box.address {
    word-break: break-all;
  }

  .no-memo {
    color: var(--color-foreground-level-5);
  }

  .confirmation {
    margin-top: 1rem;
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

  .terms-link {
    color: var(--color-foreground);
  }
</style>
