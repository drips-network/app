<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Pen from '$lib/components/icons/Pen.svelte';
  import { createEventDispatcher, type ComponentType } from 'svelte';

  const dispatch = createEventDispatcher<{ edit: { stepIndex: number } }>();

  interface ComponentAndProps {
    component: ComponentType;
    props: Record<string, unknown>;
  }

  interface Props {
    leftComponent?: ComponentAndProps | undefined;
    rightComponent?: ComponentAndProps | undefined;
    icon?: ComponentType | undefined;
    title?: string | undefined;
    editStepIndex?: number | undefined;
  }

  let {
    leftComponent = undefined,
    rightComponent = undefined,
    icon = undefined,
    title = undefined,
    editStepIndex = undefined
  }: Props = $props();
</script>

<li
  class="slot h-12 rounded-drip-xl flex items-center justify-between gap-8 shadow-low bg-background px-2"
>
  <div class="flex items-center gap-2 min-w-0">
    {#if icon}
      {@const SvelteComponent = icon}
      <div
        role="img"
        aria-label="Icon"
        class="h-8 w-8 bg-primary-level-1 flex items-center justify-center rounded-full"
      >
        <SvelteComponent style="fill: var(--color-primary);" />
      </div>
    {/if}
    {#if title}
      <div class="flex-1 min-w-0 truncate">{title}</div>
    {/if}
    {#if leftComponent}
      <leftComponent.component {...leftComponent.props} />
    {/if}
  </div>
  <div class="flex items-center gap-2">
    {#if rightComponent}
      <rightComponent.component {...rightComponent.props} />
    {/if}
    {#if editStepIndex !== undefined}<Button
        variant="ghost"
        icon={Pen}
        onclick={() =>
          editStepIndex !== undefined && dispatch('edit', { stepIndex: editStepIndex })}
        >Edit</Button
      >{/if}
  </div>
</li>
