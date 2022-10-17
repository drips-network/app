<script context="module" lang="ts">
  interface SuccessfulEvent {
    success: true;
  }

  interface FailedEvent {
    success: false;
    error: Error;
  }

  export type Result = SuccessfulEvent | FailedEvent;
</script>

<script lang="ts">
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher<{ result: Result }>();

  export let message: string;
  export let promise: () => Promise<void>;

  onMount(async () => {
    try {
      await promise();
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to resolve promise');

      dispatch('result', {
        success: false,
        error,
      });

      return;
    }

    dispatch('result', {
      success: true,
    });
  });
</script>

<div class="await-step">
  <Spinner />
  <p>{message}</p>
</div>

<style>
  .await-step {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    height: 100%;
    padding: 4rem 0;
  }

  p {
    color: var(--color-foreground-level-5);
  }
</style>
