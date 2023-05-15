<script lang="ts">
  export let headline: string | undefined = undefined;
  export let subtitle: string | undefined = undefined;
</script>

<div class="step-layout">
  <div class="top">
    {#if headline || subtitle}
      <div class="header">
        {#if headline}<h1>{headline}</h1>{/if}
        {#if subtitle}
          <p>{subtitle}</p>
        {/if}
      </div>
    {/if}
    <slot />
  </div>
  <div class="actions">
    <slot name="actions" />
  </div>
</div>

<style>
  .step-layout {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: space-between;
    height: 100%;
  }

  .top {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    margin-left: auto;
    gap: 1rem;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
