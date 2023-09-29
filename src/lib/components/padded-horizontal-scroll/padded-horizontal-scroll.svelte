<script lang="ts">
  export let enabled = true;
</script>

<div class:padded-horizontal-scroll={enabled}>
  <div class="content">
    <slot />
  </div>
  <div class="gradient left-edge" />
  <div class="gradient right-edge" />
</div>

<style>
  .padded-horizontal-scroll {
    width: calc(100% + 5rem);
    margin-left: -2.5rem;
    overflow: scroll;
  }

  .padded-horizontal-scroll > .content {
    min-width: 100%;
    padding: 1px 2.5rem; /* 1px so box-shadow outlined content is not clipped */
    width: fit-content;
  }

  .gradient {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2rem;
  }

  .gradient.left-edge {
    left: -0;
    background: linear-gradient(to right, var(--color-background) 0%, transparent);
  }

  .gradient.right-edge {
    right: 0;
    background: linear-gradient(to left, var(--color-background) 0%, transparent);
  }
</style>
