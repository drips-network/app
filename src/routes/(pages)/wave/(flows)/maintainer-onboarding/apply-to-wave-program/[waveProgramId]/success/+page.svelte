<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import FlowStepWrapper from '../../../../shared/flow-step-wrapper.svelte';

  let { data } = $props();
</script>

<FlowStepWrapper
  confetti
  headline="Success"
  description="You successfully applied the selected repo(s) to the {data.waveProgram
    .name} Wave Program."
>
  <AnnotationBox type="info">
    We'll email you when we have any updates about your applications. You can check your maintainer
    dashboard anytime to review their status.
  </AnnotationBox>

  {#snippet leftActions()}
    <Button icon={ArrowLeft} href="/wave/maintainer-onboarding/apply-to-wave-program"
      >Submit more applications</Button
    >
  {/snippet}

  {#snippet actions()}
    <Button variant="primary" icon={ArrowRight} href="/wave/maintainers/repos"
      >View maintainer dashboard</Button
    >
  {/snippet}
</FlowStepWrapper>
