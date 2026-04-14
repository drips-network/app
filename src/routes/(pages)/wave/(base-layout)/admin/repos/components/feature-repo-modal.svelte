<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Star from '$lib/components/icons/Star.svelte';
  import modal from '$lib/stores/modal';
  import { featureWaveProgramRepo } from '$lib/utils/wave/wavePrograms';
  import type { WaveProgramRepoWithDetailsDto } from '$lib/utils/wave/types/waveProgram';

  interface Props {
    repo: WaveProgramRepoWithDetailsDto;
    waveProgramId: string;
    onFeatured: () => void;
  }

  let { repo, waveProgramId, onFeatured }: Props = $props();

  let multiplier = $state(
    String(repo.pointsMultiplier && repo.pointsMultiplier > 1 ? repo.pointsMultiplier : 2),
  );
  let submitting = $state(false);
  let error = $state<string | null>(null);

  let multiplierNum = $derived(parseInt(multiplier, 10));
  let canSubmit = $derived(!isNaN(multiplierNum) && multiplierNum >= 2 && !submitting);

  async function handleSubmit() {
    if (!canSubmit) return;

    submitting = true;
    error = null;

    try {
      await featureWaveProgramRepo(fetch, waveProgramId, repo.repo.id, multiplierNum);
      onFeatured();
      modal.hide();
    } catch (e) {
      error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    } finally {
      submitting = false;
    }
  }
</script>

<div class="modal">
  <StandaloneFlowStepLayout headline="Feature repo" description={repo.repo.gitHubRepoFullName}>
    <div class="fields">
      <FormField
        title="Points multiplier"
        description="Issues in this repo will earn this many times the normal points. Minimum 2."
      >
        <TextInput bind:value={multiplier} placeholder="2" variant={{ type: 'number', min: 2 }} />
      </FormField>
    </div>

    {#if error}
      <AnnotationBox type="error">{error}</AnnotationBox>
    {/if}

    {#snippet actions()}
      <Button variant="normal" disabled={submitting} onclick={modal.hide}>Cancel</Button>
      <Button
        variant="primary"
        icon={Star}
        loading={submitting}
        disabled={!canSubmit}
        onclick={handleSubmit}
      >
        Feature at {multiplierNum || '?'}x
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
