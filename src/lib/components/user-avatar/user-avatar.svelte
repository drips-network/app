<script lang="ts">
  interface Props {
    src?: string | undefined | null;
    placeholderSrc?: string | undefined | null;
    size?: number;
    imgElem?: HTMLImageElement | undefined;
  }

  let {
    src = undefined,
    placeholderSrc = undefined,
    size = 24,
    imgElem = $bindable(),
  }: Props = $props();

  let loaded = $state(false);
  let error = $state(false);

  const GITHUB_AVATAR_REGEX = /^https:\/\/avatars\.githubusercontent\.com\/u\/(\d+)/;

  const resolvedSrc = $derived.by(() => {
    if (!src) return undefined;

    const match = src.match(GITHUB_AVATAR_REGEX);
    if (match) {
      const userId = match[1];
      const apiSize = size <= 100 ? 100 : 412;
      return `/api/github-avatars/${userId}?size=${apiSize}`;
    }

    return src;
  });
</script>

<div class="avatar" style:height={size + 'px'} style:width={size + 'px'}>
  {#if resolvedSrc && !error}
    <img
      bind:this={imgElem}
      alt="user avatar"
      src={resolvedSrc}
      onload={() => (loaded = true)}
      onerror={() => (error = true)}
    />
  {/if}
  {#if placeholderSrc}
    <img class="placeholder" src={placeholderSrc} alt="user avatar placeholder" class:loaded />
  {/if}
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
    border: 1px solid var(--color-foreground-level-3);
  }

  img {
    background-color: var(--color-background);
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
