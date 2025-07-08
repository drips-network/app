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
  <h4>Drip List successfully published</h4>
  <p>
    Your new Drip List has been created and linked to the round. It is now publicly visible and may
    be funded by anyone.
  </p>
  <p>
    Use it to pay out the rewards for your round.
    <!-- TODO(rpgf): Add learn more link -->
  </p>

  <Button {loading} variant="primary" icon={CheckCircle} on:click={handleGotIt}>View round</Button>
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
