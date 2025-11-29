<script lang="ts">
  import { goto } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { applyToWorkOnIssue } from '$lib/utils/wave/issues';
  import FlowStepWrapper from '../../../../shared/flow-step-wrapper.svelte';

  let { data } = $props();

  let applicationText = $state('');

  let valid = $derived(applicationText.trim().length > 0);

  let waveHasActiveCycle = $derived(data.cycles.pagination.total > 0);

  let submitting = $state(false);
  async function handleSubmit() {
    submitting = true;

    try {
      await doWithErrorModal(async () => {
        await applyToWorkOnIssue(undefined, data.wave.id, data.issue.id, applicationText);
      });
      await goto(`/wave/contributors/issues/${data.issue.id}`);
    } finally {
      submitting = false;
    }
  }
</script>

<!-- TODO(wave): Display preview of the issue -->
<!-- TODO(wave): Show wave & cycle info -->
<!-- TODO(wave): Intro for what Wave is -->
<FlowStepWrapper
  headline="Apply to issue"
  description="Submit your application to work on this issue in the current Wave Cycle."
>
  {#if data.alreadyApplied}
    <AnnotationBox>
      You already applied to this issue in the current Wave Cycle. First withdraw your previous
      application if you want to re-apply.
    </AnnotationBox>
  {:else if waveHasActiveCycle}
    <FormField
      title="Application Text*"
      description="Explain why you'd like to work on this issue and list any relevant experience."
      type="div"
    >
      <!-- TODO(wave): Max length validation -->
      <TextArea
        bind:value={applicationText}
        placeholder="I would like to work on this issue because..."
      />
    </FormField>
  {:else}
    <!-- TODO(wave): nicer styling, info about upcoming cycle -->
    <AnnotationBox>
      This Wave does not have an active cycle at the moment, so applications cannot be submitted.
      Please check back later!
    </AnnotationBox>
  {/if}

  {#snippet leftActions()}
    <Button href={`/wave/contributors/issues/${data.issue.id}`}>View issue details</Button>
  {/snippet}

  {#snippet actions()}
    {#if waveHasActiveCycle}
      <Button
        loading={submitting}
        variant="primary"
        disabled={!valid}
        icon={Proposals}
        onclick={handleSubmit}>Apply to issue</Button
      >
    {/if}
  {/snippet}
</FlowStepWrapper>
