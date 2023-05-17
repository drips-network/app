<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Pen from 'radicle-design-system/icons/Pen.svelte';
  import { createEventDispatcher, type ComponentType } from 'svelte';

  const dispatch = createEventDispatcher<{ edit: { stepIndex: number } }>();

  export let icon: ComponentType;
  export let title: string;
  export let editStepIndex: number | undefined;
  export let preview:
    | {
        component: ComponentType;
        props: Record<string, unknown>;
      }
    | undefined;
</script>

<div class="slot">
  <div class="left">
    <div class="icon">
      <svelte:component this={icon} style="fill: var(--color-background);" />
    </div>
    <h4>{title}</h4>
    {#if preview}
      <svelte:component this={preview.component} {...preview.props} />
    {/if}
  </div>
  <div class="right">
    {#if editStepIndex !== undefined}<Button
        variant="ghost"
        icon={Pen}
        on:click={() =>
          editStepIndex !== undefined && dispatch('edit', { stepIndex: editStepIndex })}
        >Edit</Button
      >{/if}
  </div>
</div>

<style>
  .slot {
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 2rem 0 2rem 2rem;
    display: flex;
    justify-content: space-between;
    height: 3.5rem;
    align-items: center;
    padding: 0 0.75rem;
  }

  .slot > .left,
  .slot > .right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon {
    height: 2rem;
    width: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--color-foreground);
    border-radius: 1rem;
  }
</style>
