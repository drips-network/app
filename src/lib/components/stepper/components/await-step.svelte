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
  import { createEventDispatcher, onMount, SvelteComponent } from 'svelte';
  import type { UpdateAwaitStepFn } from '../types';

  const dispatch = createEventDispatcher<{ result: Result }>();

  export let message: string;
  export let subtitle: string | undefined = undefined;
  export let link: { url: string; label: string } | undefined = undefined;
  export let icon:
    | { component: typeof SvelteComponent; props: Record<string, unknown> }
    | undefined = undefined;
  export let promise: (updateFn: UpdateAwaitStepFn) => Promise<unknown>;

  const updateFn: UpdateAwaitStepFn = (params) => {
    message = params.message ?? message;
    subtitle = params.subtitle;
    link = params.link;
    icon = params.icon;
  };

  onMount(async () => {
    try {
      /*
      If the promise resolves really fast, we ensure it stays for at least 600ms
      in order to prevent a glitchy step transition.
      */
      await Promise.all([promise(updateFn), new Promise((resolve) => setTimeout(resolve, 600))]);
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to resolve promise');

      // eslint-disable-next-line no-console
      console.error(e);

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
  {#if icon}
    <svelte:component this={icon.component} {...icon.props} />
  {:else}
    <Spinner />
  {/if}
  <p>{message}</p>
  {#if subtitle}<p class="subtitle typo-text-small">{subtitle}</p>{/if}
  {#if link}
    <a class="typo-link" href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
  {/if}
</div>

<style>
  .await-step {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    min-height: 16rem;
  }

  .subtitle {
    color: var(--color-foreground-level-5);
  }
</style>
