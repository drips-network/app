<script lang="ts">
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
  import { slide } from 'svelte/transition';
  import type { AddItemError } from '../errors';
  import Button from '$lib/components/button/button.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    dismiss: void;
  }>();

  export let error: AddItemError | undefined = undefined;
  let expanded: boolean = false;
</script>

{#if error}
  {@const color = error.severity === 'error' ? 'negative' : 'caution'}
  {@const textColor = `var(--color-${color}-level-6)`}
  {#if !error.suberrors?.length}
    <div
      transition:slide={{ duration: 300 }}
      class="error {error.severity}"
      style:background-color="var(--color-{color}-level-1)"
      style:color={textColor}
    >
      <ExclamationCircle style="fill: {textColor}" />
      {error.message}
    </div>
  {:else}
    <div>
      <button
        transition:slide={{ duration: 300 }}
        on:click={() => (expanded = !expanded)}
        aria-expanded={expanded}
        class="error {error.severity} has-suberrors"
        class:expanded
        style:background-color="var(--color-{color}-level-1)"
        style:color={textColor}
      >
        <ExclamationCircle style="fill: {textColor}" />
        <div class="detail">
          <span>{error.message}</span>
          <span class="typo-text">{error.submessage}</span>
        </div>
        <div class="actions">
          <span class="expand-chevron" style:transform="rotate({expanded ? 180 : 0}deg)">
            <ChevronDown
              style="fill: var(--color-negative-level-2); width: 1.5rem; height: 1.5rem;"
            />
          </span>
          <Button variant="destructive" on:click={() => dispatch('dismiss')}>Dismiss</Button>
        </div>
      </button>
      {#key expanded}
        <div class:hidden={!expanded} transition:slide|global={{ duration: 300 }}>
          {#each error.suberrors as suberror, index (index)}
            <div
              class="suberror error {error.severity} typo-text"
              style:background-color="var(--color-{color}-level-1)"
              style:color={textColor}
            >
              <div>Line {suberror.lineNumber}</div>
              <div class="detail">
                <span>{suberror.cause}</span>
                <span>{suberror.message}</span>
              </div>
            </div>
          {/each}
        </div>
      {/key}
    </div>
  {/if}
{/if}

<style>
  .error {
    height: 3.5rem;
    padding: 0.75rem;
    padding-left: 1rem;
    gap: 0.75rem;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-foreground);
  }

  .error.expanded {
    border-bottom: 1px solid var(--color-negative-level-2);
  }

  .error.has-suberrors {
    width: 100%;
  }

  .suberror {
    /* TODO: is the border too dark? */
    border-bottom: 1px solid var(--color-negative-level-2);
  }

  .suberror:last-child {
    border-bottom: 1px solid var(--color-foreground);
  }

  .detail {
    display: flex;
    flex-direction: column;
    align-items: start;
  }

  .detail > * {
    display: block;
    max-width: 430px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0 10px;
  }

  .expand-chevron {
    transition:
      transform 0.3s,
      background-color 0.3s;
    border-radius: 50%;
  }

  .hidden {
    display: none;
  }
</style>
