<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import FlowStepWrapper from '../../shared/flow-step-wrapper.svelte';

  let { data } = $props();
  let { backTo } = $derived(data);
</script>

<HeadMeta title="Success | Wave" />

<FlowStepWrapper
  confetti
  headline="Phone verification successful"
  description="Your phone number has been successfully verified, and you can now participate in the Wave."
>
  {#snippet actions()}
    <Button variant="primary" icon={ArrowRight} href={backTo || '/wave'}>Continue</Button>
  {/snippet}
</FlowStepWrapper>
