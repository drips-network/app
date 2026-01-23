<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/button/button.svelte';
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';

  const dispatch = createEventDispatcher<StepComponentEvents>();
</script>

<StepLayout center>
  <div class="circle">
    <Emoji size="huge" emoji="🙏" />
  </div>

  <StepHeader
    headline="Report submitted"
    description="Thank you for submitting the report and helping us maintain a fair, inclusive Wave for everyone. Please note that Drips cannot respond individually to every report."
  />

  <AnnotationBox type="warning">
    If you have a specific problem that requires immediate attention, please reach out to Support
    directly.
  </AnnotationBox>

  {#snippet actions()}
    <Button variant="normal" href="/wave/support" onclick={() => dispatch('conclude')}
      >Contact support</Button
    >
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
