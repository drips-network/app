<script lang="ts">
  import { browser } from '$app/environment';
  import LinkIcon from 'radicle-design-system/icons/Link.svelte';
  import ShareIcon from 'radicle-design-system/icons/Sharrow.svelte';
  import CopyIcon from 'radicle-design-system/icons/Copy.svelte';
  import CheckCircle from 'radicle-design-system/icons/CheckCircle.svelte';
  import { fade } from 'svelte/transition';

  export let text: string | undefined = undefined;
  export let url: string;

  let shareSupported = browser && navigator.share;

  function handleClick() {
    if (shareSupported) {
      navigator.share({
        text,
        url,
      });
    } else {
      // Copy URL to clipboard
      navigator.clipboard.writeText(url);

      copySuccess = true;
      setTimeout(() => (copySuccess = false), 1000);
    }
  }

  let hovering = false;
  let copySuccess = false;
</script>

{#if shareSupported}
  <button on:click={handleClick}>
    <ShareIcon style="fill:currentColor" />
    Share
  </button>
{:else}
  <button
    on:mouseenter={() => (hovering = true)}
    on:focus={() => (hovering = true)}
    on:mouseleave={() => (hovering = false)}
    on:blur={() => (hovering = false)}
    on:click={handleClick}
    class:copy-success={copySuccess}
  >
    <div class="icon">
      {#if copySuccess}
        <span transition:fade={{ duration: 200 }}>
          <CheckCircle style="fill: var(--color-positive)" />
        </span>
      {:else if hovering}
        <span transition:fade={{ duration: 200 }}>
          <CopyIcon style="fill: var(--color-primary-level-6)" />
        </span>
      {:else}
        <span transition:fade={{ duration: 200 }}><LinkIcon style="fill: currentColor" /></span>
      {/if}
    </div>
    Copy link
  </button>
{/if}

<style>
  button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  button .icon {
    height: 2rem;
    width: 2rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 1rem;
  }

  button .icon > * {
    position: absolute;
  }

  button:hover:not(.copy-success) .icon,
  button:focus-visible:not(.copy-success) .icon {
    background-color: var(--color-primary-level-1);
  }
</style>
