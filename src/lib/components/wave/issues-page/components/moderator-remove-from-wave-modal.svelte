<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import modal from '$lib/stores/modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { WaveProgramDto } from '$lib/utils/wave/types/waveProgram';
  import { moderatorRemoveIssueFromWave } from '$lib/utils/wave/wavePrograms';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import { notifyIssuesUpdated } from '../issue-update-coordinator';

  interface Props {
    issue: IssueDetailsDto;
    waveProgram: WaveProgramDto;
  }

  let { issue, waveProgram }: Props = $props();

  let reason = $state('');
  let loading = $state(false);
  let reasonFocussed = $state(false);

  const MIN_REASON_LENGTH = 1;
  const MAX_REASON_LENGTH = 500;

  let reasonTooShort = $derived(reason.length < MIN_REASON_LENGTH);
  let reasonTooLong = $derived(reason.length > MAX_REASON_LENGTH);
  let reasonValid = $derived(!reasonTooShort && !reasonTooLong);

  let canSubmit = $derived(reasonValid);

  async function handleSubmit() {
    loading = true;

    // Capture values before async operations since parent state may change
    const waveProgramId = waveProgram.id;
    const issueId = issue.id;

    try {
      await doWithErrorModal(async () => {
        await moderatorRemoveIssueFromWave(undefined, waveProgramId, issueId, reason);

        notifyIssuesUpdated([
          {
            ...issue,
            waveProgramId: null,
            assignedApplicant: null,
          },
        ]);

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
    headline="Moderator: Remove issue from Wave"
    description="Remove this issue from the {waveProgram.name} Wave Program. The user who added this issue will be notified."
  >
    <AnnotationBox type="warning">
      This action is logged for audit purposes and cannot be undone. If someone is assigned to this
      issue, they will lose their assignment.
    </AnnotationBox>

    <div class="fields">
      <FormField title="Issue" type="div">
        <div class="issue-info">
          <span class="typo-text-bold">#{issue.gitHubIssueNumber}</span>
          <span>{issue.title}</span>
        </div>
      </FormField>

      <FormField
        title="Reason*"
        description="Explain why you're removing this issue from the wave."
        type="div"
        validationState={reasonValid
          ? { type: 'valid' }
          : reasonFocussed
            ? {
                type: 'invalid',
                message: reasonTooShort
                  ? 'A reason is required.'
                  : reasonTooLong
                    ? `Reason must not exceed ${MAX_REASON_LENGTH} characters.`
                    : 'This field is required.',
              }
            : { type: 'valid' }}
      >
        <TextArea
          bind:value={reason}
          placeholder="E.g., Issue violates wave program guidelines..."
          onblur={() => (reasonFocussed = true)}
        />
        <div class="char-count">
          <span class:too-long={reasonTooLong} class="tnum"
            >{reason.length} / {MAX_REASON_LENGTH}</span
          >
        </div>
      </FormField>
    </div>

    {#snippet actions()}
      <Button variant="normal" disabled={loading} onclick={modal.hide}>Cancel</Button>
      <Button
        variant="destructive"
        icon={Trash}
        {loading}
        disabled={!canSubmit}
        onclick={handleSubmit}
      >
        Remove from Wave
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

  .issue-info {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
    background-color: var(--color-foreground-level-1);
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
  }

  .issue-info span:first-child {
    color: var(--color-foreground-level-5);
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
