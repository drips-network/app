<script lang="ts">
  export let disableScroll = false;
  export let innerElem: HTMLDivElement | undefined = undefined;
</script>

<div class="wrapper" class:disable-scroll={disableScroll}>
  <div class="inner" bind:this={innerElem}>
    <div class="content">
      <slot />
    </div>
  </div>
  <div class="gradient left-edge" />
  <div class="gradient right-edge" />
</div>

<style>
  .wrapper {
    width: calc(100% + 2rem);
    margin-left: -1rem;
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
    padding: 1px 1rem; /* 1px so box-shadow outlined content is not clipped */
    width: fit-content;
  }

  .gradient {
    position: absolute;
    top: 0;
    bottom: 0;
    pointer-events: none;
    width: 1rem;
  }

  .gradient.left-edge {
    left: -0;
    background: linear-gradient(to right, var(--color-background) 0%, transparent);
  }

  .gradient.right-edge {
    right: 0;
    background: linear-gradient(to left, var(--color-background) 0%, transparent);
  }

  @media (max-width: 577px) {
    .wrapper {
      margin-left: -1rem;
      width: calc(100% + 2rem);
    }

    .inner > .content {
      padding: 1px 1rem; /* 1px so box-shadow outlined content is not clipped */
    }

    .gradient {
      width: 1rem;
    }
  }
</style>
