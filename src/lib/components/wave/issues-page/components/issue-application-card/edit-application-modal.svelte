<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import modal from '$lib/stores/modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { editIssueApplication, getIssue } from '$lib/utils/wave/issues';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { IssueApplicationWithDetailsDto } from '$lib/utils/wave/types/issue-application';
  import { notifyIssuesUpdated } from '../../issue-update-coordinator';
  import { invalidate } from '$app/navigation';

  interface Props {
    issue: IssueDetailsDto;
    application: IssueApplicationWithDetailsDto;
  }

  let { issue, application }: Props = $props();

  const MIN_LENGTH = 10;
  const MAX_LENGTH = 2000;

  let applicationText = $state(application.applicationText);
  let loading = $state(false);
  let touched = $state(false);

  let tooShort = $derived(applicationText.length < MIN_LENGTH);
  let tooLong = $derived(applicationText.length > MAX_LENGTH);
  let textValid = $derived(!tooShort && !tooLong);
  let textChanged = $derived(applicationText !== application.applicationText);
  let canSubmit = $derived(textChanged && textValid);

  async function handleSubmit() {
    loading = true;

    try {
      await doWithErrorModal(async () => {
        if (!issue.waveProgramId) throw new Error('Issue is not part of a Wave Program');

        await editIssueApplication(
          undefined,
          issue.waveProgramId,
          issue.id,
          application.id,
          applicationText,
        );

        const updatedIssue = await getIssue(undefined, issue.id);
        if (updatedIssue) notifyIssuesUpdated([updatedIssue]);
        await invalidate('wave:issues');
        modal.hide();
      });
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal">
  <StandaloneFlowStepLayout
    headline="Edit application"
    description="Update your application text for this issue."
  >
    <div class="fields">
      <FormField
        title="Application text"
        description="Describe why you're a good fit for this issue."
        type="div"
        validationState={textValid
          ? { type: 'valid' }
          : touched
            ? {
                type: 'invalid',
                message: tooShort
                  ? `Application text must be at least ${MIN_LENGTH} characters.`
                  : tooLong
                    ? `Application text must not exceed ${MAX_LENGTH} characters.`
                    : 'This field is required.',
              }
            : { type: 'valid' }}
      >
        <TextArea
          bind:value={applicationText}
          placeholder="Describe your relevant experience and approach..."
          onblur={() => (touched = true)}
        />
        <div class="char-count">
          <span class:too-long={tooLong} class="tnum">{applicationText.length} / {MAX_LENGTH}</span>
        </div>
      </FormField>
    </div>

    {#snippet actions()}
      <Button variant="normal" disabled={loading} onclick={modal.hide}>Cancel</Button>
      <Button
        variant="primary"
        icon={CheckCircle}
        {loading}
        disabled={!canSubmit}
        onclick={handleSubmit}
      >
        Save changes
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

  .char-count {
    font-size: 0.75rem;
    color: var(--color-foreground-level-5);
    text-align: right;
    margin-top: 0.25rem;
  }

  .too-long {
    color: var(--color-negative);
  }
</style>
