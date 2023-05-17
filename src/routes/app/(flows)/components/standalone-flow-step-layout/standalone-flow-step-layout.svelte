<script lang="ts">
  export let description: string | undefined = undefined;
</script>

<div class="step-layout">
  <div class="top">
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
    min-height: 32rem;
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
