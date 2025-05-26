<script lang="ts">
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import type { ComponentType } from 'svelte';

  export let icon: ComponentType;
  export let done: boolean;
  export let optional = false;
  export let title: string;
  export let error: boolean = false;

  export let href: string;

  let iconFillColor: string;
  $: {
    if (error) {
      iconFillColor = 'var(--color-negative)';
    } else if (done) {
      iconFillColor = 'var(--color-positive-level-6)';
    } else if (optional) {
      iconFillColor = 'var(--color-foreground-level-5)';
    } else {
      iconFillColor = 'var(--color-foreground)';
    }
  }
</script>

<li>
  <a {href} class="todo-list-item" class:done class:error class:optional>
    <svelte:component this={icon} style="fill: {iconFillColor}" />
    <h2 class="typo-text-bold">{title}</h2>
    {#if error}
      <CrossCircle style="fill: {iconFillColor}" />
    {:else if done}
      <CheckCircle style="fill: {iconFillColor}" />
    {:else if optional}
      <ArrowRight style="fill: {iconFillColor}" />
    {/if}
  </a>
</li>

<style>
  .todo-list-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.25rem;
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    transition:
      color 0.3s,
      background-color 0.3s;
  }

  .todo-list-item:hover,
  .todo-list-item:focus-visible {
    background-color: var(--color-foreground-level-2);
  }

  .todo-list-item.optional {
    color: var(--color-foreground-level-5);
  }

  .todo-list-item.done {
    color: var(--color-positive-level-6);
  }

  .todo-list-item.error {
    color: var(--color-negative);
  }

  h2 {
    flex-grow: 1;
  }
</style>
