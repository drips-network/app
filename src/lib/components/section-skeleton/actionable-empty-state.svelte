<script lang="ts">
  import EmptyState from './empty-state.svelte';

  export let emoji: string | undefined = undefined;
  export let headline: string | undefined = undefined;
  export let description: string | undefined = undefined;
</script>

<div class="dynamic-empty-state">
  <EmptyState {emoji} {headline} text={description} />
  <div class="buttons">
    <slot name="actions" />
  </div>
</div>

<style>
  .dynamic-empty-state {
    height: 100%;
    padding: 25vh 0;
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-direction: column;
    align-items: center;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
  }
</style>
