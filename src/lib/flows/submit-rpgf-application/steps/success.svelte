<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { goto, invalidateAll } from '$app/navigation';
  import type { Writable } from 'svelte/store';

  export let context: Writable<{ applicationId: string | null }>;
  export let roundSlug: string;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let loading = false;

  async function handleView() {
    loading = true;

    // Delete the in-progress application from localstorage
    localStorage.removeItem(`rpgf-form-data-${roundSlug}`);

    await invalidateAll();
    await goto(`/app/rpgf/rounds/${roundSlug}/applications/${$context.applicationId}`);

    loading = false;
    dispatch('conclude');
  }
</script>

<div class="center-div">
  <h4>Congratulations!</h4>
  <p>
    Youʼve successfully submitted your application. The round organizers are reviewing it now. Visit
    the round's page and click "All applications" to check on your applications at any time.
  </p>

  <Button {loading} variant="primary" icon={ArrowBoxUpRight} on:click={handleView}
    >View your application</Button
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
