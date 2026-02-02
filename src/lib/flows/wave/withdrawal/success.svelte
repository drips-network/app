<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/button/button.svelte';
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';

  const dispatch = createEventDispatcher<StepComponentEvents>();
</script>

<StepLayout center>
  <div class="circle">
    <Emoji size="huge" emoji="🚀" />
  </div>

  <StepHeader
    headline="Withdrawal requested"
    description="Your withdrawal has been submitted and will be processed within 7 business days. We'll send you a confirmation email once the funds have been sent to your wallet."
  />

  {#snippet actions()}
    <Button variant="primary" onclick={() => dispatch('conclude')}>Got it</Button>
  {/snippet}
</StepLayout>

<style>
  .circle {
    padding: 1rem;
    border-radius: 50%;
    border: 2px solid var(--color-primary-level-2);
  }
</style>
