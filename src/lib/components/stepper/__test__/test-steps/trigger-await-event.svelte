<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '../../types';

  const dispatch = createEventDispatcher<StepComponentEvents>();
</script>

Trigger await event step
<Button
  on:click={() =>
    dispatch('await', {
      message: 'Await success message',
      promise: () => new Promise((resolve) => setTimeout(resolve, 1000)),
    })}>Await success</Button
>
<Button
  on:click={() =>
    dispatch('await', {
      message: 'Await error message',
      promise: () => new Promise((_, reject) => setTimeout(reject, 1000)),
    })}>Await error</Button
>
