<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { goto } from '$app/navigation';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';

  export let roundSlug: string;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let loading = false;

  async function handleGotIt() {
    loading = true;

    await goto(`/app/rpgf/rounds/${roundSlug}`);

    dispatch('conclude');
  }
</script>

<div class="center-div">
  <h4>Congratulations!</h4>
  <p>
    Your ballot has successfully been submitted. You can view and make edits until voting closes.
  </p>

  <Button {loading} variant="primary" icon={CheckCircle} on:click={handleGotIt}
    >Back to the round</Button
  >
</div>

<style>
  .center-div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    min-height: 16rem;
    text-align: center;
  }
</style>
