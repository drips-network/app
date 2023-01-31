<script lang="ts">
  export let background = false;
</script>

<div class="image-and-caption">
  <div class="image" class:with-background={background}>
    {#if background}<div class="background" />{/if}
    <div class="image-wrapper">
      <slot name="image" />
    </div>
  </div>
  <slot name="caption" />
</div>

<style>
  .image-and-caption {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
    padding: var(--spacing-m);
  }

  .image {
    position: relative;
    overflow: hidden;
    border-radius: var(--border-radius-pointy-inner);
  }

  .image.with-background {
    height: 16rem;
    padding: 1rem 1rem 0 1rem;
  }

  .image-wrapper {
    height: 100%;
    position: relative;
    z-index: 1;
  }

  .background {
    border-radius: var(--border-radius-pointy-inner);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background-color: var(--color-primary-level-1);
    height: 75%;
  }
</style>
