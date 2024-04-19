<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '../button/button.svelte';
  import Emoji from '../emoji/emoji.svelte';
  import StepHeader from '../step-header/step-header.svelte';
  import StepLayout from '../step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '../stepper/types';
  import modal from '$lib/stores/modal';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let message: string | (() => string);
  export let action: 'close' | 'hide-modal' | 'continue' = 'close';
  export let onAction: (() => void) | undefined = undefined;

  export let safeAppMode = false;

  function handleConfirm() {
    if (action === 'continue') {
      dispatch('goForward');
    } else if (action === 'hide-modal') {
      modal.hide();
    } else {
      dispatch('conclude');
    }

    onAction?.();
  }
</script>

<div class="success-step">
  <StepLayout center>
    {#if safeAppMode}
      <Emoji size="huge" emoji="⏳" />
      <StepHeader
        headline="Continue in your Safe"
        description="Please execute the proposed transaction(s) in your Safe. Once executed, check back here to see the result."
      />
    {:else}
      <Emoji size="huge" emoji="✅" />
      <StepHeader
        headline="Success"
        description={typeof message === 'function' ? message() : message}
      />
    {/if}
    <svelte:fragment slot="actions">
      <Button variant="primary" on:click={handleConfirm}
        >{action === 'close' ? 'Got it' : 'Continue'}</Button
      >
    </svelte:fragment>
  </StepLayout>
</div>

<style>
</style>
