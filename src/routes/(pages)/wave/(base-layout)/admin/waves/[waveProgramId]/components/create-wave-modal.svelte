<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import DateInput from '$lib/components/date-picker/DateInput.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import modal from '$lib/stores/modal';
  import { manualCreateWave } from '$lib/utils/wave/wavePrograms';

  interface Props {
    waveProgramId: string;
    presetBudgetUSD: string;
    onCreated: () => void;
  }

  let { waveProgramId, presetBudgetUSD, onCreated }: Props = $props();

  let startDate = $state<Date | null>(null);
  let endDate = $state<Date | null>(null);
  let budgetUSD = $state<string>(presetBudgetUSD);
  let submitting = $state(false);
  let error = $state<string | null>(null);

  const BUDGET_PATTERN = /^\d+(\.\d{1,2})?$/;

  const budgetValid = $derived(BUDGET_PATTERN.test(budgetUSD));
  const datesValid = $derived(
    startDate !== null && endDate !== null && endDate.getTime() > startDate.getTime(),
  );
  const canSubmit = $derived(budgetValid && datesValid && !submitting);

  const budgetValidationState = $derived.by(() => {
    if (budgetUSD.length === 0) return undefined;
    if (!BUDGET_PATTERN.test(budgetUSD)) {
      return { type: 'invalid' as const, message: 'Must be a decimal number, e.g. "50000.00".' };
    }
    return { type: 'valid' as const };
  });

  async function handleSubmit() {
    if (!canSubmit || !startDate || !endDate) return;

    submitting = true;
    error = null;

    try {
      await manualCreateWave(fetch, waveProgramId, {
        startDate,
        endDate,
        budgetUSD,
      });
      onCreated();
      modal.hide();
    } catch (e) {
      error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    } finally {
      submitting = false;
    }
  }
</script>

<div class="modal">
  <StandaloneFlowStepLayout
    headline="Schedule new wave"
    description="Create a new wave for this wave program. End date must be after start date and the range must not overlap with any existing wave."
  >
    <div class="fields">
      <FormField title="Start date" type="div">
        <DateInput bind:value={startDate} timePrecision="minute" />
      </FormField>

      <FormField title="End date" type="div">
        <DateInput bind:value={endDate} timePrecision="minute" />
      </FormField>

      <FormField
        title="Budget (USD)"
        description="Total budget for this wave, in USD. Defaults to the wave program's preset budget."
        validationState={budgetValidationState}
      >
        <TextInput bind:value={budgetUSD} placeholder="50000.00" />
      </FormField>
    </div>

    {#if error}
      <AnnotationBox type="error">{error}</AnnotationBox>
    {/if}

    {#snippet actions()}
      <Button variant="normal" disabled={submitting} onclick={modal.hide}>Cancel</Button>
      <Button
        variant="primary"
        icon={Plus}
        loading={submitting}
        disabled={!canSubmit}
        onclick={handleSubmit}
      >
        Schedule
      </Button>
    {/snippet}
  </StandaloneFlowStepLayout>
</div>

<style>
  .modal {
    padding: 1rem;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
