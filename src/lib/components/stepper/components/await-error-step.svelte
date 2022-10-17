<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import { createEventDispatcher } from 'svelte';

  export let message: string;

  const dispatch = createEventDispatcher<{ retry: never }>();
</script>

Sorry, something went wrong. Here's the error message: {message};

<Button on:click={() => dispatch('retry')}>Try again</Button>
