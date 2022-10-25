<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '../../types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let text: string;
</script>

{text}
<Button on:click={() => dispatch('goForward')}>Continue</Button>
<Button on:click={() => dispatch('goBackward')}>Go back</Button>
