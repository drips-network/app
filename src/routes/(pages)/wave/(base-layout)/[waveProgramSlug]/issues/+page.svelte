<script>
  import EmptyState from '$lib/components/section-skeleton/empty-state.svelte';
</script>

<div class="empty">
  <EmptyState emoji="👀" headline="" text="Select an issue on the left to view details" />
</div>

<style>
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
</style>
