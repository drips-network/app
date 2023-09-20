<script lang="ts">
  export let src: string | undefined = undefined;
  export let placeholderSrc: string | undefined = undefined;
  export let size = 24;
  export let outline = true;

  export let imgElem: HTMLImageElement | undefined = undefined;

  $: currentSize = `${size}px`;

  let loaded = false;
</script>

<div class="avatar" style:height={currentSize} style:width={currentSize}>
  {#if src}
    <img
      class:outlined={outline}
      bind:this={imgElem}
      alt="user avatar"
      {src}
      on:load={() => (loaded = true)}
    />
  {/if}
  <img
    class:outlined={outline}
    class="placeholder"
    src={placeholderSrc}
    alt="user avatar placeholder"
    class:loaded
  />
</div>

<style>
  .avatar {
    position: relative;
    flex-shrink: 0;
  }

  img,
  .placeholder {
    border-radius: 0.75rem;
    position: absolute;
    height: 100%;
    width: 100%;
    border-radius: calc(100% / 2);
    object-fit: cover;
    box-sizing: border-box;
  }

  img.outlined {
    box-shadow: var(--elevation-low);
  }

  .placeholder {
    background-color: var(--color-foreground-level-2);
    opacity: 1;
    transition: opacity 0.3s;
  }

  .placeholder.loaded {
    opacity: 0;
  }
</style>
