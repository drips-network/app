<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import FlowStepWrapper from '../../shared/flow-step-wrapper.svelte';
</script>

<FlowStepWrapper
  confetti
  headline="KYC submission received"
  description="Thank you for submitting the required information. It is being reviewed now."
>
  <AnnotationBox type="info">
    We will notify you via email once your KYC has been approved. This is usually fast, but may take
    1-3 business days. You can check on the status of your identity verification anytime in
    Settings.

    <p style:margin-top="1rem" class="typo-text-small-bold">
      If you haven't already, please ensure you have any relevant payout addresses configured in
      order to be eligible for Wave rewards.
    </p>
  </AnnotationBox>

  {#snippet actions()}
    <Button variant="primary" icon={ArrowRight} href="/wave/settings/identity-and-payments">
      Review payout settings
    </Button>
  {/snippet}
</FlowStepWrapper>
