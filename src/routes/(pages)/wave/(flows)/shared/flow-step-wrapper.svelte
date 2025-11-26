<script lang="ts">
  import type { Component } from 'svelte';

  interface Props {
    headline?: string | undefined;
    description?: string | undefined;
    icon?: Component | undefined;
    children?: import('svelte').Snippet;
    leftActions?: import('svelte').Snippet;
    actions?: import('svelte').Snippet;
  }

  let {
    headline = undefined,
    description = undefined,
    icon = undefined,
    children,
    leftActions,
    actions,
  }: Props = $props();
</script>

<div class="step-layout">
  <div class="top">
    {#if icon}
      {@const SvelteComponent = icon}
      <div class="icon">
        <SvelteComponent />
      </div>
    {/if}
    {#if headline}
      <h1 class="pixelated">{headline}</h1>
    {/if}
    {#if description}
      <div class="header">
        {#if description}
          <p>{description}</p>
        {/if}
      </div>
    {/if}
  </div>
  {@render children?.()}
  <div class="actions">
    <div class="left">
      {@render leftActions?.()}
    </div>
    <div class="right">
      {@render actions?.()}
    </div>
  </div>
</div>

<style>
  .step-layout {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: space-between;
    height: 100%;
    min-height: 8rem;
    width: 100%;
  }

  .top {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;
    max-width: 38rem;
    margin: 0 auto;
  }

  .top .icon {
    height: 6rem;
    width: 6rem;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
  }

  .actions > .right {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
