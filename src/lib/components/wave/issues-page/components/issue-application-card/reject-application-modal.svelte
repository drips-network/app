<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import modal from '$lib/stores/modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { rejectIssueApplication, getIssue } from '$lib/utils/wave/issues';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { IssueApplicationWithDetailsDto } from '$lib/utils/wave/types/issue-application';
  import { notifyIssuesUpdated } from '../../issue-update-coordinator';
  import { invalidate } from '$app/navigation';

  interface Props {
    issue: IssueDetailsDto;
    application: IssueApplicationWithDetailsDto;
  }

  let { issue, application }: Props = $props();

  const MAX_LENGTH = 500;

  let reason = $state('');
  let loading = $state(false);

  let tooLong = $derived(reason.length > MAX_LENGTH);

  async function handleSubmit() {
    loading = true;

    try {
      await doWithErrorModal(async () => {
        if (!issue.waveProgramId) throw new Error('Issue is not part of a Wave Program');

        await rejectIssueApplication(
          undefined,
          issue.waveProgramId,
          issue.id,
          application.id,
          reason.trim() || undefined,
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
    headline="Reject application"
    description="Reject this application from {application.applicant
      .gitHubUsername}. The applicant will be notified, and their application quota will be freed up."
  >
    <div class="fields">
      <FormField
        title="Reason (optional)"
        description="Optionally provide a reason for the rejection."
        type="div"
        validationState={tooLong
          ? {
              type: 'invalid',
              message: `Reason must not exceed ${MAX_LENGTH} characters.`,
            }
          : { type: 'valid' }}
      >
        <TextArea bind:value={reason} placeholder="Provide a reason for the rejection..." />
        <div class="char-count">
          <span class:too-long={tooLong} class="tnum">{reason.length} / {MAX_LENGTH}</span>
        </div>
      </FormField>
    </div>

    {#snippet actions()}
      <Button variant="normal" disabled={loading} onclick={modal.hide}>Cancel</Button>
      <Button
        variant="destructive"
        icon={Cross}
        {loading}
        disabled={tooLong}
        onclick={handleSubmit}
      >
        Reject application
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
