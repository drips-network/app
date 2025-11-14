<script lang="ts">
  export let sideMargin = 0;

  $: widthStyle = sideMargin < 0 ? `calc(100% + ${-sideMargin * 2}rem)` : '100%';
</script>

<div class="divider" style={`margin: 0.25rem ${sideMargin}rem; width: ${widthStyle}`}></div>

<style>
  .divider {
    height: 1px;
    border-radius: 0.25rem;
    background-color: var(--color-foreground-level-3);
  }
</style>
