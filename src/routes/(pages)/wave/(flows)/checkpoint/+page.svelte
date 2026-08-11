<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import LockAndKeyEmoji from '$lib/components/icons/🔐.svelte';
  import FlowStepWrapper from '../shared/flow-step-wrapper.svelte';

  let { data } = $props();
  let { checkpoint, backTo } = $derived(data);

  // Only 'rejected' is a failure. An 'expired' attempt was abandoned or
  // superseded by a newer one rather than failed, so telling that user "that
  // check didn't go through" would be wrong — they get the first-time copy.
  let previousAttemptFailed = $derived(checkpoint.challengeStatus === 'rejected');

  let description = $derived(
    previousAttemptFailed
      ? "That check didn't go through. Take a new selfie in good light with nothing covering your face."
      : "Before you continue, we need to verify it's really you with a quick selfie.",
  );
</script>

<FlowStepWrapper icon={LockAndKeyEmoji} headline="Quick checkpoint" {description}>
  {#if checkpoint.locked}
    <AnnotationBox type="warning">
      <span class="typo-text-small-bold">You've run out of identity checks for now.</span>
      Please get in touch with support and we'll help you sort it out.

      {#snippet actions()}
        <Button href="https://docs.drips.network/wave/contributors/faq" target="_blank">
          Contact support
        </Button>
      {/snippet}
    </AnnotationBox>
  {:else}
    <AnnotationBox type="info">
      It usually takes less than a minute, and you'll be able to withdraw your rewards immediately
      afterwards.

      {#snippet actions()}
        <Button
          href="https://docs.drips.network/wave/contributors/solving-issues-and-earning-rewards#verifying-your-identity"
          target="_blank"
          icon={ArrowBoxUpRight}
        >
          Learn more
        </Button>
      {/snippet}
    </AnnotationBox>
  {/if}

  {#snippet leftActions()}
    <Button variant="ghost" href="/wave">Back to Wave</Button>
  {/snippet}

  {#snippet actions()}
    {#if !checkpoint.locked}
      <!-- `noPreload` because the verify load starts a checkpoint challenge —
           hover-preloading it would burn an attempt without a click. -->
      <Button
        variant="primary"
        icon={ArrowRight}
        noPreload
        href={`/wave/checkpoint/verify?backTo=${encodeURIComponent(backTo)}`}
      >
        {previousAttemptFailed ? 'Try again' : 'Start check'}
      </Button>
    {/if}
  {/snippet}
</FlowStepWrapper>
