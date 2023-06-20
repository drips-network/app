<script lang="ts">
  export let title: string;
</script>

<div class="step-header">
  <h1>{title}</h1>
  <div class="illustration">
    <slot name="illustration" />
  </div>
</div>

<style>
  .step-header {
    height: 13rem;
    position: relative;
    padding: 0 1rem 0 2rem;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-foreground);
  }

  h1 {
    margin-top: auto;
    margin-bottom: 2rem;
  }

  .illustration {
    height: 130%;
    transform: translateY(-15%);
  }
</style>
