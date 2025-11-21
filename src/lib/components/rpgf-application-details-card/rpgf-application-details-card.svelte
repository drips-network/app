<script lang="ts">
  import storedWritable from '@efstajas/svelte-stored-writable';
  import TransitionedHeight from '../transitioned-height/transitioned-height.svelte';
  import z from 'zod';
  import { browser } from '$app/environment';
  import ChevronDown from '../icons/ChevronDown.svelte';
  import { fly } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';

  interface Props {
    key: string;
    title: string;
    right?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
  }

  let { key, title, right, children }: Props = $props();

  const isOpen = storedWritable(
    `rpgf-application-details-card-${key}-open`,
    z.boolean(),
    true,
    !browser,
  );

  let hasRightComponent = $derived(right);
</script>

<div class="rpgf-application-details-card">
  <div class="title-bar">
    <div class="left">
      <button
        class="expand-button"
        aria-label="Expand section"
        class:expanded={$isOpen}
        onclick={() => ($isOpen = !$isOpen)}
      >
        <ChevronDown style="fill: var(--color-foreground); height: 1.5rem; width: 1.5rem;" />
      </button>

      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <h5 style:cursor="pointer" onclick={() => ($isOpen = !$isOpen)}>{title}</h5>
    </div>

    {#if $isOpen && hasRightComponent}
      <div
        in:fly={{ y: -10, duration: 300, easing: cubicInOut }}
        out:fly={{ y: -10, duration: 300, easing: cubicInOut }}
        class="right"
      >
        {@render right?.()}
      </div>
    {/if}
  </div>

  <TransitionedHeight negativeMarginWhileCollapsed="-1rem" collapsed={!$isOpen}>
    <div class="content">
      {@render children?.()}
    </div>
  </TransitionedHeight>
</div>

<style>
  .rpgf-application-details-card {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--color-foreground-level-3);
  }

  .title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .title-bar .left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }

  .title-bar .right {
    height: 1.5rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .expand-button {
    background-color: var(--color-foreground-level-2);
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    transition:
      transform 0.3s,
      background-color 0.3s;
  }

  .expand-button.expanded {
    transform: rotate(180deg);
  }
</style>
