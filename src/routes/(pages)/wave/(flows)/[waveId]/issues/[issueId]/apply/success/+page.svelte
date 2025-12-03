<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import FlowStepWrapper from '../../../../../shared/flow-step-wrapper.svelte';

  let { data } = $props();
</script>

<FlowStepWrapper
  confetti
  headline="Application received"
  description={`Thanks for applying to work on #${data.issue.gitHubIssueNumber} in this ${data.wave.name} Wave Cycle.`}
>
  <AnnotationBox type="info">
    Your application has been received. We'll let you know as soon as the maintainers accept you to
    work on the issue. You can also keep tabs on your applications anytime from your contributor
    dashboard, which shows all issues you've applied to.
  </AnnotationBox>

  {#snippet actions()}
    <Button variant="primary" icon={ArrowRight} href={`/wave/contributors/issues/${data.issue.id}`}>
      Contributor dashboard
    </Button>
  {/snippet}
</FlowStepWrapper>
