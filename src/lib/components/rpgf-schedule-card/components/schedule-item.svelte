<script lang="ts">
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';

  export let title: string;
  export let date: Date;
  export let isActive: boolean;
  export let isDone: boolean;
  export let until: Date | undefined;

  export let elem: HTMLTimeElement;

  export let expanded = false;

  export let onExpandChange: (expanded: boolean) => void = () => {};
  $: {
    // trigger expanded after 0.3s transition
    setTimeout(() => {
      onExpandChange(expanded);
    }, 300);
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<time
  class:active={isActive}
  class:done={isDone}
  bind:this={elem}
  class="schedule-item"
  datetime={date.toISOString()}
  on:click={() => (expanded = !expanded)}
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
    {!until ? 'Starting ' : ''}
    {date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })}<br />
  </p>

  <TransitionedHeight negativeMarginWhileCollapsed="-0.25rem" collapsed={!expanded}>
    <div style:color="var(--color-foreground-level-6)">
      <slot />
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
