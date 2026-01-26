<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import Coin from '$lib/components/icons/Coin.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import modal from '$lib/stores/modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { WaveProgramDto } from '$lib/utils/wave/types/waveProgram';
  import { moderatorIssuePoints } from '$lib/utils/wave/wavePrograms';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import { notifyIssuesUpdated } from '../issue-update-coordinator';
  import { getIssue } from '$lib/utils/wave/issues';

  interface Props {
    issue: IssueDetailsDto;
    waveProgram: WaveProgramDto;
  }

  let { issue, waveProgram }: Props = $props();

  let reason = $state('');
  let loading = $state(false);
  let reasonFocussed = $state(false);

  const MIN_REASON_LENGTH = 20;
  const MAX_REASON_LENGTH = 2000;

  let reasonTooShort = $derived(reason.length < MIN_REASON_LENGTH);
  let reasonTooLong = $derived(reason.length > MAX_REASON_LENGTH);
  let reasonValid = $derived(!reasonTooShort && !reasonTooLong);

  let canSubmit = $derived(reasonValid);

  async function handleSubmit() {
    loading = true;

    const waveProgramId = waveProgram.id;
    const issueId = issue.id;

    try {
      await doWithErrorModal(async () => {
        await moderatorIssuePoints(undefined, waveProgramId, issueId, reason);

        const updatedIssue = await getIssue(undefined, issueId);
        if (updatedIssue) {
          notifyIssuesUpdated([updatedIssue]);
        }

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
    headline="Moderator: Issue points early"
    description="Manually issue points for this issue to the assigned contributor."
  >
    <AnnotationBox type="warning">
      Only use this action if you have verified that the contributor completed the work (e.g., a PR
      was merged but not properly linked to the issue). This action is logged for audit purposes.
    </AnnotationBox>

    <div class="fields">
      <FormField title="Issue" type="div">
        <div class="issue-info">
          <span class="typo-text-bold">#{issue.gitHubIssueNumber}</span>
          <span>{issue.title}</span>
        </div>
      </FormField>

      <FormField title="Assigned to" type="div">
        <div class="issue-info">
          <span>{issue.assignedApplicant?.gitHubUsername ?? 'Unknown'}</span>
        </div>
      </FormField>

      <FormField
        title="Reason*"
        description="Explain why you're issuing points early for this issue."
        type="div"
        validationState={reasonValid
          ? { type: 'valid' }
          : reasonFocussed
            ? {
                type: 'invalid',
                message: reasonTooShort
                  ? 'A reason is required (min 20 chars).'
                  : reasonTooLong
                    ? `Reason must not exceed ${MAX_REASON_LENGTH} characters.`
                    : 'This field is required.',
              }
            : { type: 'valid' }}
      >
        <TextArea
          bind:value={reason}
          placeholder="E.g., The contributor completed all required work. The PR was merged but the issue wasn't linked properly."
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
      <Button variant="primary" icon={Coin} {loading} disabled={!canSubmit} onclick={handleSubmit}>
        Issue points
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
