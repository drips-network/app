<script lang="ts">
  import EmptyState from './empty-state.svelte';

  interface Props {
    emoji?: string | undefined;
    headline?: string | undefined;
    description?: string | undefined;
    actions?: import('svelte').Snippet;
  }

  let {
    emoji = undefined,
    headline = undefined,
    description = undefined,
    actions,
  }: Props = $props();
</script>

<div class="dynamic-empty-state">
  <EmptyState {emoji} {headline} text={description} />
  <div class="buttons">
    {@render actions?.()}
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
