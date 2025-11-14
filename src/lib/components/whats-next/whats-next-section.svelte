<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="whats-next">
  {@render children?.()}
</div>

<style>
  .whats-next {
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }
</style>
