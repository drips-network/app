<script lang="ts">
  import modal from '$lib/stores/modal';
  import CheckCircle from 'radicle-design-system/icons/CheckCircle.svelte';
  import { createEventDispatcher } from 'svelte';
  import Button from '../button/button.svelte';
  import type { StepComponentEvents } from '../stepper/types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let message: string | (() => string);
  export let action: 'close' | 'continue' = 'close';

  function handleConfirm() {
    if (action === 'continue') {
      dispatch('goForward');
    } else {
      modal.hide();
    }
  }
</script>

<div class="success-step">
  <CheckCircle style="height: 4rem; width: 4rem; fill: var(--color-positive);" />
  <h3>Success</h3>
  <p>{typeof message === 'function' ? message() : message}</p>
  <Button on:click={handleConfirm}>{action === 'close' ? 'Close' : 'Continue'}</Button>
</div>

<style>
  .success-step {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    align-items: center;
  }

  p {
    color: var(--color-foreground-level-6);
    margin-bottom: 1rem;
  }
</style>
