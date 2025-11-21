<script lang="ts">
  interface Props {
    center?: boolean;
    children?: import('svelte').Snippet;
    left_actions?: import('svelte').Snippet;
    actions?: import('svelte').Snippet;
  }

  let { center = false, children, left_actions, actions }: Props = $props();
</script>

<div class="step-layout" class:center>
  <div class="content">
    {@render children?.()}
  </div>
  {#if left_actions || actions}
    <footer class="flex justify-between gap-4">
      <div class="flex gap-2">
        {@render left_actions?.()}
      </div>
      <div class="flex gap-2">
        {@render actions?.()}
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
    text-align: center;
  }
</style>
