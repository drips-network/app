<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Pen from 'radicle-design-system/icons/Pen.svelte';
  import { createEventDispatcher, type ComponentType } from 'svelte';

  const dispatch = createEventDispatcher<{ edit: { stepIndex: number } }>();

  interface ComponentAndProps {
    component: ComponentType;
    props: Record<string, unknown>;
  }

  export let leftComponent: ComponentAndProps | undefined = undefined;
  export let rightComponent: ComponentAndProps | undefined = undefined;
  export let icon: ComponentType | undefined = undefined;
  export let title: string | undefined = undefined;
  export let editStepIndex: number | undefined = undefined;
</script>

<div class="slot">
  <div class="left">
    {#if icon}
      <div class="icon">
        <svelte:component this={icon} style="fill: var(--color-background);" />
      </div>
    {/if}
    {#if title}
      <h4>{title}</h4>
    {/if}
    {#if leftComponent}
      <svelte:component this={leftComponent.component} {...leftComponent.props} />
    {/if}
  </div>
  <div class="right">
    {#if rightComponent}
      <svelte:component this={rightComponent.component} {...rightComponent.props} />
    {/if}
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
