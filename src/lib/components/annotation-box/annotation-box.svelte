<script lang="ts">
  import WarningIcon from 'radicle-design-system/icons/ExclamationCircle.svelte';
  export let type: 'warning' | 'info' = 'warning';
</script>

<div class="annotation-box typo-text-small {type}">
  <WarningIcon style="height: 1.25rem; width: 1.25rem; fill: var(--color-caution-level-6)" />
  <slot />
</div>

<style>
  .annotation-box {
    border-radius: 1rem 0 1rem 1rem;
    padding: 0.75rem;
    text-align: left;
    display: flex;
    gap: 0.5rem;
  }

  .annotation-box.warning {
    background-color: var(--color-caution-level-1);
    border: 1px solid var(--color-caution-level-6);
    color: var(--color-caution-level-6);
  }

  .annotation-box.info {
    background-color: var(--color-primary-level-1);
    border: 1px solid var(--color-primary-level-6);
  }
</style>
