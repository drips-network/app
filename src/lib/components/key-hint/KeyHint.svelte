<script lang="ts">
  export let style: string | undefined = undefined;
</script>

<div class="hint-container" {style}>
  <p class="typo-text hint"><slot /></p>
</div>

<style>
  .hint-container {
    display: flex;
  }

  .hint {
    background-color: var(--color-foreground-level-2);
    color: var(--color-foreground-level-6);
    padding: 0.125rem 0.375rem;
    border-radius: 2rem 0 2rem 2rem;
    min-width: 1.75rem;
    text-align: center;
  }
</style>
