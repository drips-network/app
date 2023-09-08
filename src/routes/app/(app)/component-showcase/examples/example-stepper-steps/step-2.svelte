<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();
</script>

Step 2
<Button on:click={() => dispatch('goBackward')}>Back</Button>
<Button
  on:click={() =>
    dispatch('await', {
      message: 'Waiting for 2 seconds...',
      promise: () => new Promise((resolve) => setTimeout(resolve, 2000)),
    })}>Trigger an await event that resolves (success)</Button
>

<Button
  on:click={() =>
    dispatch('await', {
      message: 'Throwing an error in 2 seconds...',
      promise: () => new Promise((_, reject) => setTimeout(reject, 2000)),
    })}>Trigger an await event that rejects (error)</Button
>
