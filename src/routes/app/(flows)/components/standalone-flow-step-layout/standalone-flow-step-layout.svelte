<script lang="ts">
  export let headline: string | undefined = undefined;
  export let description: string | undefined = undefined;
</script>

<div class="step-layout">
  <div class="top">
    {#if headline}
      <h2 class="pixelated">{headline}</h2>
    {/if}
    {#if description}
      <div class="header">
        {#if description}
          <p>{description}</p>
        {/if}
      </div>
    {/if}
    <slot />
  </div>
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
  }

  .top {
    display: flex;
    flex-direction: column;
    gap: 2rem;
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
