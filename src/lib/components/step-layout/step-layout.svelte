<script lang="ts">
  export let center = false;
</script>

<div class="step-layout" class:center>
  <div class="content">
    <slot />
  </div>
  {#if $$slots['left-actions'] || $$slots.actions}
    <footer class="flex justify-between gap-4">
      <div class="flex gap-2">
        <slot name="left-actions" />
      </div>
      <div class="flex gap-2">
        <slot name="actions" />
      </div>
    </footer>
  {/if}
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
</style>
