<script lang="ts">
  export let src: string | undefined = undefined;
  export let placeholderSrc: string | undefined = undefined;

  let loaded = false;
</script>

<div class="avatar">
  {#if src}
    <img alt="user avatar" {src} on:load={() => (loaded = true)} />
  {/if}
  <img class="placeholder" src={placeholderSrc} alt="user avatar placeholder" class:loaded />
</div>

<style>
  .avatar {
    height: 1.5rem;
    width: 1.5rem;
  }

  img,
  .placeholder {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.75rem;
    position: absolute;
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
