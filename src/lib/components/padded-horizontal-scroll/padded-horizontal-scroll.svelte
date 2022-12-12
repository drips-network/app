<script lang="ts">
  export let enabled = true;
</script>

<div class:padded-horizontal-scroll={enabled}>
  <div class="content">
    <slot />
  </div>
</div>

<style>
  .padded-horizontal-scroll {
    width: calc(100% + 2rem);
    margin-left: -1rem;
    overflow: scroll;
  }

  .padded-horizontal-scroll > .content {
    min-width: 100%;
    padding: 0 1rem;
    width: fit-content;
  }
</style>
