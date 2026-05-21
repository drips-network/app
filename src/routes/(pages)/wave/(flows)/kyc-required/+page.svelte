<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import FlowStepWrapper from '../shared/flow-step-wrapper.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import LockAndKeyEmoji from '$lib/components/icons/🔐.svelte';

  let { data } = $props();
</script>

<HeadMeta title="Verify your identity | Wave" />

<FlowStepWrapper
  icon={LockAndKeyEmoji}
  headline="Verify your identity"
  description="Verify your identity now so you can withdraw the rewards you earn from completing issues. This usually takes less than 5 minutes."
>
  <div class="container">
    <AnnotationBox type="warning">
      <span class="typo-text-small-bold"
        >A verified identity is required for applying to issues</span
      >
      to avoid problems during reward withdrawals later.
      {#snippet actions()}
        <Button
          href="https://docs.drips.network/wave/contributors/solving-issues-and-earning-rewards#verifying-your-identity"
          target="_blank">Learn more</Button
        >
      {/snippet}
    </AnnotationBox>
    <div class="action-options">
      <Button
        variant="primary"
        size="large"
        icon={ArrowRight}
        href={`/wave/kyc?backTo=${encodeURIComponent(data.backTo)}`}
      >
        Verify identity
      </Button>
      <Button variant="ghost" href={data.backTo}>Skip for now</Button>
    </div>
  </div>
</FlowStepWrapper>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    max-width: 32rem;
    margin: 0 auto;
  }

  .action-options {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  :global(.action-options a) {
    width: 100%;
    justify-content: center;
  }
</style>
