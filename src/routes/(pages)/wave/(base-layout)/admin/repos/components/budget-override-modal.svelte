<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Coin from '$lib/components/icons/Coin.svelte';
  import modal from '$lib/stores/modal';
  import { setRepoBudgetOverride, removeRepoBudgetOverride } from '$lib/utils/wave/wavePrograms';
  import type { WaveProgramRepoWithDetailsDto } from '$lib/utils/wave/types/waveProgram';

  interface Props {
    repo: WaveProgramRepoWithDetailsDto;
    waveProgramId: string;
    onChanged: () => void;
  }

  let { repo, waveProgramId, onChanged }: Props = $props();

  let hasExistingOverride = $derived(repo.pointsBudgetOverride != null);

  let budget = $state(repo.pointsBudgetOverride != null ? String(repo.pointsBudgetOverride) : '');
  let submitting = $state(false);
  let error = $state<string | null>(null);

  let budgetNum = $derived(Number(budget));
  let canSubmit = $derived(
    Number.isFinite(budgetNum) && Number.isInteger(budgetNum) && budgetNum >= 1 && !submitting,
  );

  async function handleSubmit() {
    if (!canSubmit) return;

    submitting = true;
    error = null;

    try {
      await setRepoBudgetOverride(fetch, waveProgramId, repo.repo.id, budgetNum);
      onChanged();
      modal.hide();
    } catch (e) {
      error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    } finally {
      submitting = false;
    }
  }

  async function handleRemove() {
    submitting = true;
    error = null;

    try {
      await removeRepoBudgetOverride(fetch, waveProgramId, repo.repo.id);
      onChanged();
      modal.hide();
    } catch (e) {
      error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    } finally {
      submitting = false;
    }
  }
</script>

<div class="modal">
  <StandaloneFlowStepLayout headline="Budget override" description={repo.repo.gitHubRepoFullName}>
    <div class="fields">
      <FormField
        title="Points budget"
        description="Override the wave program's default per-repo budget for this repo. Leave empty and remove to use the program default."
      >
        <TextInput
          bind:value={budget}
          placeholder={repo.pointsBudget != null ? String(repo.pointsBudget) : 'Unlimited'}
          variant={{ type: 'number', min: 1 }}
        />
      </FormField>
    </div>

    {#if error}
      <AnnotationBox type="error">{error}</AnnotationBox>
    {/if}

    {#snippet actions()}
      {#if hasExistingOverride}
        <Button variant="destructive-outline" disabled={submitting} onclick={handleRemove}
          >Remove override</Button
        >
      {/if}
      <Button variant="normal" disabled={submitting} onclick={modal.hide}>Cancel</Button>
      <Button
        variant="primary"
        icon={Coin}
        loading={submitting}
        disabled={!canSubmit}
        onclick={handleSubmit}
      >
        Set budget to {budgetNum || '?'}
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
