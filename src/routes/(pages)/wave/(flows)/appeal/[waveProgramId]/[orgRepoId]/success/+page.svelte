<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import FlowStepWrapper from '../../../../shared/flow-step-wrapper.svelte';
</script>

<FlowStepWrapper
  headline="Appeal submitted"
  description="Thank you — your appeal is now pending review."
>
  <div class="circle">
    <Emoji size="huge" emoji="📨" />
  </div>

  <AnnotationBox type="info">
    We'll email you when we have any updates. You can track its status anytime on your maintainer
    dashboard.
  </AnnotationBox>

  {#snippet actions()}
    <Button variant="primary" icon={ArrowRight} href="/wave/maintainers/repos?status=rejected"
      >View maintainer dashboard</Button
    >
  {/snippet}
</FlowStepWrapper>

<style>
  .circle {
    padding: 1rem;
    border-radius: 50%;
    border: 2px solid var(--color-primary-level-2);
    align-self: center;
  }
</style>
