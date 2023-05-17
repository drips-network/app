<script lang="ts" context="module">
  import { tick, type ComponentType } from 'svelte';

  export interface Slot {
    icon: ComponentType;
    title: string;
    preview:
      | {
          component: ComponentType;
          props: Record<string, unknown>;
        }
      | undefined;
    editStepIndex: number | undefined;
  }

  export type Slots = Slot[];

  export type SlotsForSteps = Record<number, Slots>;
</script>

<script lang="ts">
  import StandaloneFlowSlot from './components/standalone-flow-slot.svelte';
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';

  export let slots: Slots;

  let slotsElem: HTMLDivElement;

  let wrapperHeight = tweened(0, {
    duration: 300,
    easing: cubicInOut,
  });

  async function updateHeight() {
    await tick();

    if (slots.length === 0) {
      wrapperHeight.set(0);
      return;
    }

    wrapperHeight.set(slotsElem?.offsetHeight ?? 0);
  }

  let prevSlots = slots;
  $: {
    if (JSON.stringify(prevSlots) !== JSON.stringify(slots)) updateHeight();
    prevSlots = slots;
  }
</script>

<div class="wrapper" style:height="{$wrapperHeight}px">
  {#if slots.length > 0}
    <div transition:fade class="slots" bind:this={slotsElem}>
      {#each slots as slot}
        <StandaloneFlowSlot on:edit {...slot} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .slots {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background-color: var(--color-foreground-level-1);
    border-bottom: 1px solid var(--color-foreground);
  }

  .wrapper {
    overflow: hidden;
  }
</style>
