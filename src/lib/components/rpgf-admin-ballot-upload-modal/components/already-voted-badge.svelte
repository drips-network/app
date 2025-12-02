<script>
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
</script>

<div class="already-voted-badge typo-text-small">
  <ExclamationCircle style="height: 1rem; fill: var(--color-caution-level-6)" />
  Already voted
</div>

<style>
  .already-voted-badge {
    display: flex;
    align-items: center;
    color: var(--color-caution-level-6);
    background-color: var(--color-caution-level-1);
    padding: 0.125rem 0.5rem 0.125rem 0.125rem;
    border-radius: 1rem 0 1rem 1rem;
  }
</style>
