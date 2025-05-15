<script lang="ts">
  export let disableScroll = false;
</script>

<div class="wrapper" class:disable-scroll={disableScroll}>
  <div class="inner">
    <div class="content">
      <slot />
    </div>
  </div>
  <div class="gradient left-edge" />
  <div class="gradient right-edge" />
</div>

<style>
  .wrapper {
    width: calc(100% + 5rem);
    margin-left: -2.5rem;
    position: relative;
  }

  .wrapper .inner {
    overflow: scroll;
  }

  .wrapper.disable-scroll .inner {
    overflow: hidden;
  }

  .content {
    position: relative;
  }

  .inner > .content {
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
    z-index: 1;
  }

  .gradient.right-edge {
    right: 0;
    background: linear-gradient(to left, var(--color-background) 0%, transparent);
    z-index: 1;
  }
</style>
