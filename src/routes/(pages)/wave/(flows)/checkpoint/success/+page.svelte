<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import FlowStepWrapper from '../../shared/flow-step-wrapper.svelte';

  let { data } = $props();
  let { backTo } = $derived(data);
</script>

<FlowStepWrapper
  confetti
  headline="You're all set"
  description="Your grants page is unlocked and you can now view and manage your reward grants."
>
  {#snippet actions()}
    <Button variant="primary" icon={ArrowRight} href={backTo}>Continue</Button>
  {/snippet}
</FlowStepWrapper>
