<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import SegmentedControl from '$lib/components/segmented-control/segmented-control.svelte';
  import modal from '$lib/stores/modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { getPointsForComplexity } from '$lib/utils/wave/get-points-for-complexity';
  import { getIssue } from '$lib/utils/wave/issues';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import type { Complexity, WaveDto } from '$lib/utils/wave/types/wave';
  import { updateWaveIssueComplexity } from '$lib/utils/wave/waves';
  import { notifyIssuesUpdated } from '../issue-update-coordinator';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';

  interface Props {
    issue: IssueDetailsDto;
    wave: WaveDto;
    onIssueUpdated?: (issue: IssueDetailsDto) => void;
  }

  let { issue, wave, onIssueUpdated }: Props = $props();

  const initialComplexity: Complexity | null = issue.complexity ?? null;

  let activeComplexity: Complexity = $state(initialComplexity ?? 'small');
  let loading = $state(false);

  let canSubmit = $derived(initialComplexity ? activeComplexity !== initialComplexity : true);

  async function handleSubmit() {
    loading = true;

    try {
      await doWithErrorModal(async () => {
        await updateWaveIssueComplexity(undefined, wave.id, issue.id, activeComplexity);
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
    headline="Update issue complexity"
    description="Adjust the complexity level for this issue to reflect its difficulty and reward contributors accordingly."
  >
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
              { title: 'Trivial', value: 'small' },
              { title: 'Medium', value: 'medium' },
              { title: 'High', value: 'large' },
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
</style>
