<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import FlowStepWrapper from '../../../../shared/flow-step-wrapper.svelte';

  let { data } = $props();
</script>

<HeadMeta
  title="Compliments | {data.issue.title} | {data.waveProgram.name} Wave"
  description="Compliments are no longer available."
/>

<FlowStepWrapper
  headline="Compliments deprecated"
  description="Compliments have been replaced by a new review system."
>
  <AnnotationBox type="warning">
    It is no longer possible to submit compliments. You can now leave a review instead.
  </AnnotationBox>

  {#snippet actions()}
    <Button variant="primary" icon={ArrowLeft} href={`/wave/maintainers/issues/${data.issue.id}`}>
      Back to the issue
    </Button>
  {/snippet}
</FlowStepWrapper>
