<script lang="ts">
  import type { ComponentType } from 'svelte';

  export let headline: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let icon: ComponentType | undefined = undefined;
</script>

<div class="step-layout">
  <div class="top">
    {#if icon}
      <div class="icon">
        <svelte:component this={icon} />
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
  <slot />
  <div class="actions">
    <div class="left">
      <slot name="left-actions" />
    </div>
    <div class="right">
      <slot name="actions" />
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
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
