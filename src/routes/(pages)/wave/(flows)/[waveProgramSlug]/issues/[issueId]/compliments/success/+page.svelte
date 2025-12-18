<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import FlowStepWrapper from '../../../../../shared/flow-step-wrapper.svelte';

  let { data } = $props();
</script>

<HeadMeta title="Successful compliment | {data.issue.title} | {data.waveProgram.name} Wave" />

<FlowStepWrapper
  confetti
  headline="Compliments received"
  description="Your compliment has been recorded. {data.issue.assignedApplicant
    ?.gitHubUsername} has received the extra points, and has been notified."
>
  {#snippet actions()}
    <Button variant="primary" icon={ArrowRight} href={`/wave/maintainers/issues/${data.issue.id}`}>
      Back to the issue
    </Button>
  {/snippet}
</FlowStepWrapper>
