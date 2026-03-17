<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import FlowStepWrapper from '../../../shared/flow-step-wrapper.svelte';
</script>

<HeadMeta title="Discord Linked | Wave" />

<FlowStepWrapper
  confetti
  headline="Discord linked"
  description="Your Discord account has been successfully linked to your Wave account."
>
  <AnnotationBox type="info">
    Your Discord roles have been updated. You'll receive the "Wave Contributor" role for earning
    points, and the "Wave Project Maintainer" role if you have approved repositories.
  </AnnotationBox>

  {#snippet actions()}
    <Button variant="primary" icon={ArrowRight} href="/wave/settings/identity-and-payments">
      Go to settings
    </Button>
  {/snippet}
</FlowStepWrapper>
