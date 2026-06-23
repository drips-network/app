<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import DateInput from '$lib/components/date-picker/DateInput.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import modal from '$lib/stores/modal';
  import { updateWave } from '$lib/utils/wave/wavePrograms';
  import type { WaveDto } from '$lib/utils/wave/types/waveProgram';

  interface Props {
    waveProgramId: string;
    wave: WaveDto;
    onUpdated: () => void;
  }

  let { waveProgramId, wave, onUpdated }: Props = $props();

  // Active waves are extend-only: start date and budget are locked,
  // and the end date can only be moved later (not earlier than the current end).
  const isActive = wave.status === 'active';
  const originalEndDate = new Date(wave.endDate);

  let startDate = $state<Date | null>(new Date(wave.startDate));
  let endDate = $state<Date | null>(new Date(wave.endDate));
  let budgetUSD = $state<string>(String(wave.budgetUSD));
  let submitting = $state(false);
  let error = $state<string | null>(null);

  const BUDGET_PATTERN = /^\d+(\.\d{1,2})?$/;

  const budgetValid = $derived(BUDGET_PATTERN.test(budgetUSD));
  const datesValid = $derived(
    startDate !== null &&
      endDate !== null &&
      endDate.getTime() > startDate.getTime() &&
      (!isActive || endDate.getTime() >= originalEndDate.getTime()),
  );

  const changes = $derived.by(() => {
    const out: { startDate?: Date; endDate?: Date; budgetUSD?: string } = {};
    if (!isActive && startDate && startDate.getTime() !== new Date(wave.startDate).getTime()) {
      out.startDate = startDate;
    }
    if (endDate && endDate.getTime() !== originalEndDate.getTime()) {
      out.endDate = endDate;
    }
    if (!isActive && budgetUSD !== String(wave.budgetUSD)) {
      out.budgetUSD = budgetUSD;
    }
    return out;
  });

  const hasChanges = $derived(Object.keys(changes).length > 0);
  const canSubmit = $derived(budgetValid && datesValid && hasChanges && !submitting);

  const endDateValidationState = $derived.by(() => {
    if (!isActive || !endDate) return undefined;
    if (endDate.getTime() < originalEndDate.getTime()) {
      return {
        type: 'invalid' as const,
        message: 'Active waves can only be extended — the end date cannot be moved earlier.',
      };
    }
    return undefined;
  });

  const budgetValidationState = $derived.by(() => {
    if (budgetUSD.length === 0) return undefined;
    if (!BUDGET_PATTERN.test(budgetUSD)) {
      return { type: 'invalid' as const, message: 'Must be a decimal number, e.g. "50000.00".' };
    }
    return { type: 'valid' as const };
  });

  async function handleSubmit() {
    if (!canSubmit) return;

    submitting = true;
    error = null;

    try {
      await updateWave(fetch, waveProgramId, wave.id, changes);
      onUpdated();
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
    headline={isActive ? `Extend Wave #${wave.waveNumber}` : `Edit Wave #${wave.waveNumber}`}
    description={isActive
      ? 'This wave is currently active, so it can only be extended. Move the end date later — start date and budget are locked.'
      : 'Adjust the schedule or budget for this wave. End date must be after start date and the range must not overlap with any other wave.'}
  >
    <div class="fields">
      <FormField title="Start date" type="div" disabled={isActive}>
        <DateInput bind:value={startDate} timePrecision="minute" disabled={isActive} />
      </FormField>

      <FormField title="End date" type="div" validationState={endDateValidationState}>
        <DateInput
          bind:value={endDate}
          timePrecision="minute"
          min={isActive ? originalEndDate : undefined}
        />
      </FormField>

      <FormField
        title="Budget (USD)"
        description="Total budget for this wave, in USD."
        validationState={budgetValidationState}
        disabled={isActive}
      >
        <TextInput bind:value={budgetUSD} placeholder="50000.00" disabled={isActive} />
      </FormField>
    </div>

    {#if error}
      <AnnotationBox type="error">{error}</AnnotationBox>
    {/if}

    {#snippet actions()}
      <Button variant="normal" disabled={submitting} onclick={modal.hide}>Cancel</Button>
      <Button variant="primary" loading={submitting} disabled={!canSubmit} onclick={handleSubmit}>
        {isActive ? 'Extend wave' : 'Save changes'}
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
