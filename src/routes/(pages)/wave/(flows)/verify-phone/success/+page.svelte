<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import FlowStepWrapper from '../../shared/flow-step-wrapper.svelte';
  import { onMount } from 'svelte';

  let { data } = $props();
  let { backTo } = $derived(data);

  onMount(() => {
    invalidate('wave:phone-verification-required');
  });
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
