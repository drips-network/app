<script lang="ts">
  import { fly } from 'svelte/transition';

  import type { SvelteComponent } from 'svelte';
  import { sineIn, sineOut } from 'svelte/easing';

  export let transitionedOut = false;

  export let maxItems = 4;

  export let components: {
    component: typeof SvelteComponent<any>;
    props: Record<string, unknown>;
  }[];
  $: displayedComponents = components.slice(0, maxItems);
  $: overflowAmount = components.length - maxItems;

  function getTransitionDelay(index: number, direction: 'in' | 'out') {
    return ((direction === 'in' ? components.length : 0) - index) * 15;
  }
</script>

<div class="pile">
  {#each displayedComponents as component}
    {#if !transitionedOut}
      <div
        class="item"
        out:fly={{
          y: 16,
          duration: 200,
          delay: getTransitionDelay(components.indexOf(component), 'out'),
          easing: sineIn,
        }}
        in:fly={{
          y: 16,
          duration: 200,
          delay: getTransitionDelay(components.indexOf(component), 'in'),
          easing: sineOut,
        }}
      >
        <svelte:component this={component.component} {...component.props} />
      </div>
    {/if}
  {/each}
  {#if overflowAmount > 0 && !transitionedOut}
    <div
      class="overflow typo-text-small-bold"
      out:fly={{
        y: 16,
        duration: 200,
        delay: getTransitionDelay(components.length - 1, 'out'),
        easing: sineIn,
      }}
      in:fly={{
        y: 16,
        duration: 200,
        delay: getTransitionDelay(components.length - 1, 'in'),
        easing: sineOut,
      }}
    >
      +{overflowAmount}
    </div>
  {/if}
</div>

<style>
  .pile {
    display: flex;
    align-items: center;
  }

  .pile .item {
    pointer-events: none;
  }

  .pile .item:not(:first-child) {
    margin-left: -0.5rem;
  }

  .overflow {
    height: 1.5rem;
    background-color: var(--color-foreground);
    color: var(--color-background);
    padding: 0 0.5rem;
    border-radius: 0.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 0.25rem;
  }
</style>
