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
    <Emoji size="huge" emoji="✉️" />
  </div>

  <StepHeader
    headline="Test transaction requested"
    description="Your test transaction has been submitted and will usually be processed within a few minutes, but up to 7 days in rare cases. We'll send you a confirmation email once the transaction has been sent."
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
