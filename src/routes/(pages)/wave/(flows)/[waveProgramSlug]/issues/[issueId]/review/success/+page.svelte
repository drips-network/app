<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import FlowStepWrapper from '../../../../../shared/flow-step-wrapper.svelte';

  let { data } = $props();

  let isOwnIssue = $derived(data.isOwnIssue);
</script>

<HeadMeta title="Review submitted | {data.issue.title} | {data.waveProgram.name} Wave" />

<FlowStepWrapper
  confetti
  headline="Review submitted"
  description="Your review has been recorded. Thank you for your feedback."
>
  {#snippet actions()}
    <Button
      variant="primary"
      icon={ArrowRight}
      href={isOwnIssue
        ? `/wave/maintainers/issues/${data.issue.id}`
        : `/wave/contributors/issues/${data.issue.id}`}
    >
      Back to the issue
    </Button>
  {/snippet}
</FlowStepWrapper>
