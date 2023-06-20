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
    width: calc(100% + 5rem);
    margin-left: -2.5rem;
    overflow: scroll;
  }

  .padded-horizontal-scroll > .content {
    min-width: 100%;
    padding: 2px 2.5rem;
    width: fit-content;
  }
</style>
