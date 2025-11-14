<script lang="ts">
  import { run } from 'svelte/legacy';

  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';





  interface Props {
    title: string;
    date: Date;
    isActive: boolean;
    isDone: boolean;
    until: Date | undefined;
    fuzzy?: boolean;
    elem: HTMLTimeElement;
    expanded?: boolean;
    onExpandChange?: (expanded: boolean) => void;
    children?: import('svelte').Snippet;
  }

  let {
    title,
    date,
    isActive,
    isDone,
    until,
    fuzzy = false,
    elem = $bindable(),
    expanded = $bindable(false),
    onExpandChange = () => {},
    children
  }: Props = $props();
  run(() => {
    // trigger expanded after 0.3s transition
    setTimeout(() => {
      onExpandChange(expanded);
    }, 300);
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<time
  class:active={isActive}
  class:done={isDone}
  bind:this={elem}
  class="schedule-item"
  datetime={date.toISOString()}
  onclick={() => (expanded = !expanded)}
  style:cursor="pointer"
>
  <div class="title">
    {#if isDone}
      <CheckCircle style="height: 1rem; width: 1rem" />
    {/if}
    <h5>{title}</h5>

    <button aria-label="Expand" style:margin-left="auto" class:expanded>
      <ChevronDown />
    </button>
  </div>
  <p style:color="var(--color-foreground-level-5)">
    {#if fuzzy}
      {date.toLocaleDateString('en-US', {
        month: 'long',
      })} onwards
    {:else}
      {!until ? 'Starting ' : ''}
      {date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })}<br />
    {/if}
  </p>

  <TransitionedHeight negativeMarginWhileCollapsed="-0.25rem" collapsed={!expanded}>
    <div style:color="var(--color-foreground-level-6)">
      {@render children?.()}
    </div>
  </TransitionedHeight>
</time>

<style>
  time {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  button {
    transition: transform 0.3s ease-in-out;
  }

  button.expanded {
    transform: rotate(180deg);
  }

  h5 {
    color: var(--color-foreground-level-5);
  }

  .title {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .active {
    opacity: 1;
  }

  .active h5 {
    color: var(--color-primary-level-6);
  }
</style>
