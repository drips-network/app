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
  import IssuePreviewCard from '$lib/components/wave/issue-preview-card/issue-preview-card.svelte';
  import type { Snapshot } from './$types.js';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';

  let { data } = $props();

  let applicationText = $state('');

  let valid = $derived(applicationText.trim().length >= 10 && applicationText.length <= 2000);

  let beenFocussed = $state(false);

  let tooShort = $derived(
    beenFocussed && applicationText.trim().length > 0 && applicationText.trim().length < 10,
  );
  let tooLong = $derived(applicationText.length > 2000);

  let waveProgramHasActiveWave = $derived(data.waves.pagination.total > 0);

  let submitting = $state(false);
  async function handleSubmit() {
    submitting = true;

    try {
      await doWithConfirmationModal(
        'Are you sure you want to submit this application? This will leave a comment on the GitHub issue in your name.',
        () =>
          doWithErrorModal(async () => {
            await applyToWorkOnIssue(
              undefined,
              data.waveProgram.id,
              data.issue.id,
              applicationText,
            );
          }),
      );
      await goto(`/wave/${data.waveProgram.id}/issues/${data.issue.id}/apply/success`);
    } finally {
      submitting = false;
    }
  }

  export const snapshot: Snapshot<string> = {
    capture: () => applicationText,
    restore: (value) => (applicationText = value),
  };
</script>

<HeadMeta
  title="Apply | {data.issue.title} | {data.waveProgram.name} Wave"
  description="Apply to work on this issue in the {data.waveProgram.name} Wave and get rewarded."
/>

<!-- TODO(wave): Show wave info -->
<!-- TODO(wave): Intro for what Wave is -->
<FlowStepWrapper
  headline="Apply to issue"
  description="Submit your application to work on this issue in the current {data.waveProgram
    .name} Wave."
>
  <FormField title="Issue*" type="div">
    <IssuePreviewCard issue={data.issue} />
  </FormField>

  {#if data.alreadyApplied}
    <AnnotationBox>
      You already applied to this issue in the current Wave. First withdraw your previous
      application if you want to re-apply.
    </AnnotationBox>
  {:else if data.isOwnIssue}
    <AnnotationBox>
      You cannot apply to work on an issue in a repository you maintain. Please choose issues from
      other repositories.
    </AnnotationBox>
  {:else if waveProgramHasActiveWave}
    <FormField
      title="Application Text*"
      description="Explain why you'd like to work on this issue and list any relevant experience."
      type="div"
      validationState={valid
        ? { type: 'valid' }
        : beenFocussed
          ? {
              type: 'invalid',
              message: tooShort
                ? 'Application must be at least 10 characters.'
                : tooLong
                  ? 'Application must not exceed 2000 characters.'
                  : 'This field is required.',
            }
          : { type: 'valid' }}
    >
      <TextArea
        bind:value={applicationText}
        placeholder="I would like to work on this issue because..."
        onblur={() => (beenFocussed = true)}
      />
      <div class="char-count">
        Markdown supported · <span class:too-long={tooLong} class="tnum"
          >{applicationText.length} / 2.000</span
        >
      </div>
    </FormField>
  {:else}
    <!-- TODO(wave): nicer styling, info about upcoming Wave -->
    <AnnotationBox>
      {data.waveProgram.name} does not have an active Wave at the moment, so applications cannot be submitted.
      Please check back later!
    </AnnotationBox>
  {/if}

  {#snippet leftActions()}
    <Button href={`/wave/${data.waveProgram.slug}/issues/${data.issue.id}`}
      >View issue details</Button
    >
  {/snippet}

  {#snippet actions()}
    {#if waveProgramHasActiveWave}
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

<style>
  .char-count {
    font-size: 0.875rem;
    color: var(--color-foreground-level-6);
    text-align: right;
    margin-top: 0.25rem;
  }

  .char-count .too-long {
    color: var(--color-negative);
  }
</style>
