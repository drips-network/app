<script lang="ts">
  import { fly } from 'svelte/transition';
  import { createEventDispatcher, type Component, type SvelteComponent } from 'svelte';
  import { sineIn, sineOut } from 'svelte/easing';

  function getTransitionDelay(index: number, direction: 'in' | 'out') {
    return ((direction === 'in' ? components.length : 0) - index) * 15;
  }

  interface Props {
    transitionedOut?: boolean;
    maxItems?: number;
    itemsClickable?: boolean;
    components: {
    component: Component<any>;
    props: Record<string, unknown>;
  }[];
    overflowCounterClickable?: boolean;
  }

  let {
    transitionedOut = false,
    maxItems = 4,
    itemsClickable = false,
    components,
    overflowCounterClickable = false
  }: Props = $props();
  const dispatch = createEventDispatcher();
  let displayedComponents = $derived(components.slice(0, maxItems));
  let overflowAmount = $derived(components.length - maxItems);
</script>

{#if components.length !== 0}
  <div class="pile">
    {#each displayedComponents as component}
      {#if !transitionedOut}
        <div
          class="item"
          class:pointer-events-none={!itemsClickable}
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
          <component.component {...component.props} />
        </div>
      {/if}
    {/each}
    {#if overflowAmount > 0 && !transitionedOut}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <svelte:element
        this={overflowCounterClickable ? 'button' : 'div'}
        class="overflow typo-text-small focus-visible:ring-4 focus-visible:ring-primary-level-1"
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
        onclick={() => dispatch('overflowCounterClick')}
      >
        +{overflowAmount}
      </svelte:element>
    {/if}
  </div>
{/if}

<style>
  .pile {
    display: flex;
    align-items: center;
  }

  .pile .item:not(:first-child) {
    margin-left: -0.5rem;
  }

  .overflow {
    height: 1.25rem;
    background-color: var(--color-foreground);
    color: var(--color-background);
    padding: 0 0.5rem;
    border-radius: 0.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 0.5rem;
  }
</style>
