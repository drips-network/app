<script lang="ts">
  export let center = false;
</script>

<div class="step-layout" class:center>
  <div class="content">
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
  }
  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1.5rem;
  }

  .center > .content {
    align-items: center;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
</style>
