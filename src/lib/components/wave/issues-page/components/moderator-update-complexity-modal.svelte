<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import SegmentedControl from '$lib/components/segmented-control/segmented-control.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import modal from '$lib/stores/modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { getPointsForComplexity } from '$lib/utils/wave/get-points-for-complexity';
  import { getIssue } from '$lib/utils/wave/issues';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { Complexity, WaveProgramDto } from '$lib/utils/wave/types/waveProgram';
  import { moderatorUpdateIssueComplexity } from '$lib/utils/wave/wavePrograms';
  import { notifyIssuesUpdated } from '../issue-update-coordinator';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';

  interface Props {
    issue: IssueDetailsDto;
    waveProgram: WaveProgramDto;
    onIssueUpdated?: (issue: IssueDetailsDto) => void;
  }

  let { issue, waveProgram, onIssueUpdated }: Props = $props();

  const initialComplexity: Complexity | null = issue.complexity ?? null;

  let activeComplexity: Complexity = $state(initialComplexity ?? 'small');
  let reason = $state('');
  let loading = $state(false);
  let reasonFocussed = $state(false);

  const MIN_REASON_LENGTH = 1;
  const MAX_REASON_LENGTH = 500;

  let reasonTooShort = $derived(reason.length < MIN_REASON_LENGTH);
  let reasonTooLong = $derived(reason.length > MAX_REASON_LENGTH);
  let reasonValid = $derived(!reasonTooShort && !reasonTooLong);

  let complexityChanged = $derived(
    initialComplexity ? activeComplexity !== initialComplexity : true,
  );
  let canSubmit = $derived(complexityChanged && reasonValid);

  async function handleSubmit() {
    loading = true;

    try {
      await doWithErrorModal(async () => {
        await moderatorUpdateIssueComplexity(
          undefined,
          waveProgram.id,
          issue.id,
          activeComplexity,
          reason,
        );
        const updatedIssue = await getIssue(undefined, issue.id);

        if (!updatedIssue) {
          throw new Error('Issue could not be reloaded. Please try again.');
        }

        notifyIssuesUpdated([updatedIssue]);
        onIssueUpdated?.(updatedIssue);
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
    headline="Moderator: Adjust complexity"
    description="As a moderator, you can adjust the complexity level for this issue regardless of assignment status. The user who added this issue will be notified."
  >
    <AnnotationBox type="warning">
      This action is logged for audit purposes. Please provide a clear reason for the adjustment.
    </AnnotationBox>

    <div class="fields">
      <FormField
        title="Complexity*"
        description="This determines the base reward for contributors working on this issue."
        type="div"
      >
        <div style:width="max-content">
          <SegmentedControl
            bind:active={activeComplexity}
            options={[
              {
                title: 'Trivial',
                value: 'small',
              },
              {
                title: 'Medium',
                value: 'medium',
              },
              {
                title: 'High',
                value: 'large',
              },
            ]}
          />
        </div>
      </FormField>

      <FormField
        title="Points"
        description="Points earned combine a base value with the complexity bonus."
        type="div"
      >
        <span class="typo-text complexity-calc">
          <span style:color="var(--color-foreground-level-5)">
            100 <span class="typo-text-bold">Base Points</span> +
            {getPointsForComplexity(activeComplexity)}
            <span class="typo-text-bold">Complexity Bonus</span> =
          </span>
          <span class="typo-text-bold">
            {100 + getPointsForComplexity(activeComplexity)} Points
          </span>
        </span>
      </FormField>

      <FormField
        title="Reason*"
        description="Explain why you're adjusting the complexity."
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
          placeholder="E.g., Issue scope was incorrectly estimated..."
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
        variant="primary"
        icon={CheckCircle}
        {loading}
        disabled={!canSubmit}
        onclick={handleSubmit}
      >
        Update complexity
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

  .complexity-calc {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    background-color: var(--color-foreground-level-1);
    width: fit-content;
    padding: 0.5rem 1rem;
    border-radius: 2rem 0 2rem 2rem;
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
