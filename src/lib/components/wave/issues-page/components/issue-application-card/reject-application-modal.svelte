<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Cross from '$lib/components/icons/Cross.svelte';
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

  let loading = $state(false);

  async function handleSubmit() {
    loading = true;

    try {
      await doWithErrorModal(async () => {
        if (!issue.waveProgramId) throw new Error('Issue is not part of a Wave Program');

        await rejectIssueApplication(undefined, issue.waveProgramId, issue.id, application.id);

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
    {#snippet actions()}
      <Button variant="normal" disabled={loading} onclick={modal.hide}>Cancel</Button>
      <Button variant="destructive" icon={Cross} {loading} onclick={handleSubmit}>
        Reject application
      </Button>
    {/snippet}
  </StandaloneFlowStepLayout>
</div>

<style>
  .modal {
    padding: 1rem;
  }
</style>
