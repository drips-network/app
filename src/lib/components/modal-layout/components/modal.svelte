<script lang="ts">
  interface Props {
    style?: string | undefined;
    children?: import('svelte').Snippet;
  }

  let { style = undefined, children }: Props = $props();
</script>

<div class="modal" {style}>
  {@render children?.()}
</div>

<style>
  .modal {
    background: var(--color-background);
    border-radius: 2rem 0 2rem 2rem;
    box-shadow: var(--elevation-high);
    width: 74vw;
    max-width: 42rem;
    text-align: center;
  }

  @media only screen and (max-width: 54rem) {
    .modal {
      width: 95vw;
    }
  }
</style>
