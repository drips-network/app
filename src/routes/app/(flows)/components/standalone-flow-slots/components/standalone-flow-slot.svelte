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

<li
  class="slot h-12 rounded-drip-xl flex items-center justify-between gap-8 shadow-low bg-background px-4"
>
  <div class="flex items-center gap-2 min-w-0">
    {#if icon}
      <div
        role="img"
        aria-label="Icon"
        class="h-8 w-8 bg-primary-level-1 flex items-center justify-center rounded-full"
      >
        <svelte:component this={icon} style="fill: var(--color-primary);" />
      </div>
    {/if}
    {#if title}
      <div class="flex-1 min-w-0 truncate">{title}</div>
    {/if}
    {#if leftComponent}
      <svelte:component this={leftComponent.component} {...leftComponent.props} />
    {/if}
  </div>
  <div class="flex items-center gap-2">
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
</li>
