<script lang="ts">
  interface Props {
    sideMargin?: number;
  }

  let { sideMargin = 0 }: Props = $props();

  let widthStyle = $derived(sideMargin < 0 ? `calc(100% + ${-sideMargin * 2}rem)` : '100%');
</script>

<div class="divider" style={`margin: 0.25rem ${sideMargin}rem; width: ${widthStyle}`}></div>

<style>
  .divider {
    height: 1px;
    border-radius: 0.25rem;
    background-color: var(--color-foreground-level-3);
  }
</style>
