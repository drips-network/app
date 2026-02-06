<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';

  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { authenticatedCall } from '$lib/utils/wave/call';
  import FlowStepWrapper from '../../../shared/flow-step-wrapper.svelte';
  import IssuePreviewCard from '$lib/components/wave/issue-preview-card/issue-preview-card.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';

  let { data } = $props();

  let isAssigned = $derived(data.issue.assignedApplicant?.id === data.user.id);

  let submitting = $state(false);

  async function handleConfirm() {
    submitting = true;

    try {
      await doWithErrorModal(async () => {
        await authenticatedCall(undefined, '/api/prs/link', {
          method: 'POST',
          body: JSON.stringify({
            gitHubPrNumber: data.gitHubPrNumber,
            orgIssueId: data.issue.id,
          }),
        });

        window.location.href = `https://github.com/${data.issue.repo.gitHubRepoFullName}/pull/${data.gitHubPrNumber}`;
      });
    } catch {
      submitting = false;
    }
  }
</script>

<FlowStepWrapper
  headline="Link PR #{data.gitHubPrNumber} to Issue"
  description="Review the details below and confirm to link your pull request."
>
  <FormField title="Issue" type="div">
    <IssuePreviewCard issue={data.issue} />
  </FormField>

  {#if !isAssigned}
    <AnnotationBox>
      You must be assigned to this issue to link a PR. Please apply to this issue and get accepted
      before linking your pull request.
    </AnnotationBox>
  {:else}
    <AnnotationBox type="info">
      Confirming will add <code>Closes #{data.issue.gitHubIssueNumber}</code> to your PR description
      and link it to this issue.
    </AnnotationBox>
  {/if}

  {#snippet leftActions()}
    <Button
      href="https://github.com/{data.issue.repo.gitHubRepoFullName}/pull/{data.gitHubPrNumber}"
    >
      Back to PR
    </Button>
  {/snippet}

  {#snippet actions()}
    {#if isAssigned}
      <Button variant="primary" icon={CheckCircle} loading={submitting} onclick={handleConfirm}>
        Confirm & link PR
      </Button>
    {/if}
  {/snippet}
</FlowStepWrapper>

<style>
  code {
    font-family: var(--typeface-mono-regular);
    color: var(--color-foreground-level-6);
    border-radius: 4px;
    padding: 0.2rem 0.4rem 0 0.4rem;
    background-color: var(--color-foreground-level-2);
  }
</style>
